var Scoop;
(function (Scoop) {
    var ConnectionService = (function () {
        function ConnectionService() {
            this.connectionCookieName = 'connections';
        }
        ConnectionService.prototype.storeConnection = function (connection) {
            if (connection.guid() == null) {
                connection.guid(UUID.generate());
            }
            var connectionsSerializable = Cookies.getJSON(this.connectionCookieName) || [];
            var guid = connection.guid();
            connectionsSerializable = connectionsSerializable.filter(function (item) {
                return item.guid != guid;
            });
            var connectionSerializable = this.toSerializable(connection);
            connectionsSerializable.push(connectionSerializable);
            this.storeCookie(connectionsSerializable);
        };
        ConnectionService.prototype.removeConnectionFromStore = function (connection) {
            var connectionsSerializable = Cookies.getJSON(this.connectionCookieName) || [];
            var guid = connection.guid();
            connectionsSerializable = connectionsSerializable.filter(function (item) {
                return item.guid != guid;
            });
            this.storeCookie(connectionsSerializable);
        };
        ConnectionService.prototype.storeCookie = function (connectionsSerializable) {
            var expires = moment().add(1, 'year').toDate();
            Cookies.set(this.connectionCookieName, connectionsSerializable, { expires: expires });
        };
        ConnectionService.prototype.getConnectionsFromStore = function () {
            var connectionsSerializable = Cookies.getJSON(this.connectionCookieName) || [];
            return connectionsSerializable;
        };
        ConnectionService.prototype.getAvailableTasks = function (connectionUri) {
            return $.ajax({
                url: connectionUri + '/AvailableTasks',
                method: 'GET',
                cache: false
            });
        };
        ConnectionService.prototype.connect = function (connection) {
            this.disconnect(connection);
            console.log('connect', connection.guid());
            var hubConnection = $.hubConnection(connection.uri());
            var onConnectionStart = $.Deferred();
            $.each(connection.chosenTasks(), function (i, task) {
                var hubProxy = null;
                if (task.hubName != null) {
                    hubProxy = hubConnection.createHubProxy(task.hubName);
                    onConnectionStart.done(function () { task.onConnect(hubProxy); });
                }
                task.init(hubProxy, connection);
            });
            hubConnection.logging = false;
            var connectionStart = hubConnection.start();
            connectionStart.done(function () {
                connection.currentHubConnection = hubConnection;
                onConnectionStart.resolve();
            });
            return connectionStart;
        };
        ConnectionService.prototype.disconnect = function (connection) {
            $.each(connection.chosenTasks(), function (i, task) {
                task.onDisconnect(connection);
            });
            if (connection.currentHubConnection)
                connection.currentHubConnection.stop();
            connection.currentHubConnection = null;
        };
        ConnectionService.prototype.toSerializable = function (connection) {
            return {
                guid: connection.guid(),
                uri: connection.uri(),
                name: connection.name(),
                autoConnect: connection.autoConnect(),
                isConnected: connection.isConnected(),
                hasConnectionProblem: connection.hasConnectionProblem(),
                connectionProblemMessage: connection.connectionProblemMessage()
            };
        };
        ConnectionService.fromSerializable = function (connectionSerializable) {
            var connection = ko.viewmodel.fromModel(connectionSerializable);
            if (!connectionSerializable.hasOwnProperty('hasConnectionProblem'))
                connection.hasConnectionProblem = ko.observable();
            if (!connectionSerializable.hasOwnProperty('connectionProblemMessage'))
                connection.connectionProblemMessage = ko.observable();
            connection.availableTasks = ko.observableArray();
            connection.isConnected = ko.observable();
            return connection;
        };
        ConnectionService.clone = function (connection) {
            return {
                guid: ko.observable(connection.guid()),
                uri: ko.observable(connection.uri()),
                name: ko.observable(connection.name()),
                autoConnect: ko.observable(connection.autoConnect()),
                isConnected: ko.observable(connection.isConnected()),
                hasConnectionProblem: ko.observable(connection.hasConnectionProblem()),
                connectionProblemMessage: ko.observable(connection.connectionProblemMessage())
            };
        };
        return ConnectionService;
    })();
    Scoop.ConnectionService = ConnectionService;
})(Scoop || (Scoop = {}));

var Scoop;
(function (Scoop) {
    var ConnectionViewModel = (function () {
        function ConnectionViewModel(connectionService) {
            var _this = this;
            this.updateAllConnectionsFromStore = function () {
                var connectionsSerializable = _this.connectionService.getConnectionsFromStore();
                _this.connections.remove(function (currentConnection) {
                    return $.grep(connectionsSerializable, function (connection, n) { return connection.guid == currentConnection.guid(); }).length == 0;
                });
                $.each(connectionsSerializable, function (i, connectionSerializable) {
                    _this.connectionService.getAvailableTasks(connectionSerializable.uri)
                        .done(function (tasks, textStatus, jqXhr) {
                        var taskInstances = $.map(tasks, function (task) {
                            var taskInstance = null;
                            if (_this.tasksCache[task.guid]) {
                                taskInstance = _this.tasksCache[task.guid];
                            }
                            else if (task.name != null) {
                                var taskClass = stringToFunction('Scoop.' + task.name);
                                if (taskClass)
                                    taskInstance = new taskClass();
                            }
                            return taskInstance;
                        });
                        var availableTasks = ko.observableArray(taskInstances);
                        var existingConnections = $.grep(_this.connections(), function (currentConnection, n) {
                            return currentConnection.guid() == connectionSerializable.guid;
                        });
                        if (existingConnections.length) {
                            $.each(existingConnections, function (n, existingConnection) {
                                existingConnection.autoConnect(connectionSerializable.autoConnect);
                                existingConnection.name(connectionSerializable.name);
                                existingConnection.uri(connectionSerializable.uri);
                                existingConnection.availableTasks = availableTasks;
                                existingConnection.chosenTasks = ko.observableArray($.map(existingConnection.chosenTasks(), function (chosenTask) {
                                    return $.grep(availableTasks(), function (availableTask, k) { return availableTask.guid == chosenTask.guid; }).length
                                        ? chosenTask
                                        : null;
                                }));
                                existingConnection.hasConnectionProblem(false);
                                existingConnection.connectionProblemMessage(null);
                                if (existingConnection.autoConnect())
                                    _this.connect(existingConnection);
                            });
                        }
                        else {
                            var connection = Scoop.ConnectionService.fromSerializable(connectionSerializable);
                            connection.availableTasks = availableTasks;
                            connection.chosenTasks = availableTasks;
                            _this.connections.push(connection);
                            if (connection.autoConnect())
                                _this.connect(connection);
                        }
                    })
                        .fail(function (jqXhr, textStatus, errorThrown) {
                        var existingConnections = $.grep(_this.connections(), function (currentConnection, n) {
                            return currentConnection.guid() == connectionSerializable.guid;
                        });
                        if (existingConnections.length) {
                            $.each(existingConnections, function (n, existingConnection) {
                                existingConnection.autoConnect(connectionSerializable.autoConnect);
                                existingConnection.name(connectionSerializable.name);
                                existingConnection.uri(connectionSerializable.uri);
                                existingConnection.availableTasks.removeAll();
                                existingConnection.chosenTasks.removeAll();
                                existingConnection.hasConnectionProblem(true);
                                if (jqXhr.status == 0)
                                    existingConnection.connectionProblemMessage('Network error. Please check console for details.');
                                else
                                    existingConnection.connectionProblemMessage(jqXhr.status + ' ' + errorThrown);
                            });
                        }
                        else {
                            var connection = Scoop.ConnectionService.fromSerializable(connectionSerializable);
                            connection.availableTasks = ko.observableArray();
                            connection.chosenTasks = ko.observableArray();
                            connection.hasConnectionProblem(true);
                            if (jqXhr.status == 0)
                                connection.connectionProblemMessage('Network error. Please check console for details.');
                            else
                                connection.connectionProblemMessage(jqXhr.status + ' ' + errorThrown);
                            _this.connections.push(connection);
                        }
                    });
                });
            };
            this.addOrUpdateConnection = function (connection) {
                var existingConnections = $.grep(_this.connections(), function (currentConnection, n) {
                    return currentConnection.guid() == connection.guid();
                });
                return _this.connectionService.getAvailableTasks(connection.uri())
                    .done(function (tasks, textStatus, jqXhr) {
                    var taskInstances = $.map(tasks, function (task) {
                        var taskInstance = null;
                        if (_this.tasksCache[task.guid]) {
                            taskInstance = _this.tasksCache[task.guid];
                        }
                        else if (task.name != null) {
                            var taskClass = stringToFunction('Scoop.' + task.name);
                            if (taskClass)
                                taskInstance = new taskClass();
                        }
                        return taskInstance;
                    });
                    var availableTasks = ko.observableArray(taskInstances);
                    if (existingConnections.length) {
                        $.each(existingConnections, function (n, existingConnection) {
                            existingConnection.autoConnect(connection.autoConnect());
                            existingConnection.name(connection.name());
                            existingConnection.uri(connection.uri());
                            existingConnection.availableTasks = availableTasks;
                            existingConnection.chosenTasks = ko.observableArray($.map(existingConnection.chosenTasks(), function (chosenTask) {
                                return $.grep(availableTasks(), function (availableTask, k) { return availableTask.guid == chosenTask.guid; }).length
                                    ? chosenTask
                                    : null;
                            }));
                            existingConnection.hasConnectionProblem(false);
                            existingConnection.connectionProblemMessage(null);
                            _this.connectionService.storeConnection(existingConnection);
                            if (existingConnection.autoConnect())
                                _this.connect(existingConnection);
                        });
                    }
                    else {
                        var newConnection = Scoop.ConnectionService.clone(connection);
                        newConnection.availableTasks = availableTasks;
                        newConnection.chosenTasks = availableTasks;
                        _this.connections.push(newConnection);
                        _this.connectionService.storeConnection(newConnection);
                        if (newConnection.autoConnect())
                            _this.connect(newConnection);
                    }
                })
                    .fail(function (jqXhr, textStatus, errorThrown) {
                    if (existingConnections.length) {
                        $.each(existingConnections, function (n, existingConnection) {
                            existingConnection.autoConnect(connection.autoConnect());
                            existingConnection.name(connection.name());
                            existingConnection.uri(connection.uri());
                            existingConnection.availableTasks.removeAll();
                            existingConnection.chosenTasks.removeAll();
                            existingConnection.hasConnectionProblem(true);
                            if (jqXhr.status == 0)
                                existingConnection.connectionProblemMessage("Network error. Please check console for details.");
                            else
                                existingConnection.connectionProblemMessage(jqXhr.status + ' ' + errorThrown);
                            _this.connectionService.storeConnection(existingConnection);
                        });
                    }
                    else {
                        var newConnection = Scoop.ConnectionService.clone(connection);
                        newConnection.hasConnectionProblem(true);
                        if (jqXhr.status == 0)
                            newConnection.connectionProblemMessage("Network error. Please check console for details.");
                        else
                            newConnection.connectionProblemMessage(jqXhr.status + ' ' + errorThrown);
                        _this.connections.push(newConnection);
                        _this.connectionService.storeConnection(newConnection);
                    }
                });
            };
            this.addConnection = function () {
                console.log('addConnection', _this.newConnection.uri());
                _this.addOrUpdateConnection(_this.newConnection)
                    .done(function () {
                    _this.resetNewConnection();
                })
                    .fail(function (jqXhr, textStatus, errorThrown) {
                });
            };
            this.removeConnection = function (connection) {
                console.log('removeConnection', connection.uri());
                if (connection.isConnected())
                    _this.disconnect(connection);
                _this.connections.remove(connection);
                _this.connectionService.removeConnectionFromStore(connection);
            };
            this.connect = function (connection) {
                console.log('connect');
                _this.connectionService.connect(connection)
                    .done(function () {
                    connection.isConnected(true);
                });
            };
            this.disconnect = function (connection) {
                console.log('disconnect');
                _this.connectionService.disconnect(connection);
                connection.isConnected(false);
            };
            this.enableAutoConnect = function (connection) {
                console.log('enableAutoConnect');
                connection.autoConnect(true);
                _this.connectionService.storeConnection(connection);
                _this.connect(connection);
            };
            this.disableAutoConnect = function (connection) {
                console.log('disableAutoConnect');
                connection.autoConnect(false);
                _this.connectionService.storeConnection(connection);
            };
            this.connectionService = connectionService;
            this.resetNewConnection();
            this.connections = ko.observableArray([]);
            this.tasksCache = {};
            this.updateAllConnectionsFromStore();
        }
        ConnectionViewModel.prototype.resetNewConnection = function () {
            if (this.newConnection) {
                this.newConnection.guid(null);
                this.newConnection.uri('');
                this.newConnection.name('');
                this.newConnection.autoConnect(false);
                this.newConnection.isConnected(false);
                this.newConnection.hasConnectionProblem(false);
                this.newConnection.connectionProblemMessage(null);
            }
            else {
                this.newConnection = ko.viewmodel.fromModel({
                    guid: null,
                    uri: '',
                    name: '',
                    autoConnect: false,
                    isConnected: false,
                    hasConnectionProblem: false,
                    connectionProblemMessage: ''
                });
            }
        };
        return ConnectionViewModel;
    })();
    Scoop.ConnectionViewModel = ConnectionViewModel;
})(Scoop || (Scoop = {}));

var Scoop;
(function (Scoop) {
    var AutoUpdateTask = (function () {
        function AutoUpdateTask() {
        }
        AutoUpdateTask.prototype.init = function (hubProxy, connection) { };
        AutoUpdateTask.prototype.onConnect = function (hubProxy) { };
        AutoUpdateTask.prototype.onDisconnect = function (connection) { };
        return AutoUpdateTask;
    })();
    Scoop.AutoUpdateTask = AutoUpdateTask;
})(Scoop || (Scoop = {}));

var Scoop;
(function (Scoop) {
    var PerformanceTask = (function () {
        function PerformanceTask() {
            this.hubName = 'performanceHub';
            this.charts = {};
            this.performanceData = {};
        }
        PerformanceTask.prototype.init = function (hubProxy, connection) {
            var _this = this;
            if (hubProxy != null) {
                hubProxy.on('updatePerformance', function (taskName, values, timestamp) {
                    _this.updatePerformanceData(connection, taskName, values, timestamp);
                    _this.updatePerformanceChart(connection);
                });
                hubProxy.on('updatePerformanceHistory', function (taskResultHistory) {
                    _this.clearPerformanceData(connection);
                    for (var i = 0; i < taskResultHistory.length; i++) {
                        var taskResult = taskResultHistory[i];
                        _this.updatePerformanceData(connection, taskResult.Name, taskResult.Values, taskResult.Timestamp);
                    }
                    _this.updatePerformanceChart(connection);
                });
            }
        };
        PerformanceTask.prototype.onConnect = function (hubProxy) {
            if (hubProxy != null)
                hubProxy.invoke('GetPerformanceHistory');
        };
        PerformanceTask.prototype.onDisconnect = function (connection) {
            this.removePerformanceChart(connection);
        };
        PerformanceTask.prototype.clearPerformanceData = function (connection) {
            delete this.performanceData[connection.guid()];
        };
        PerformanceTask.prototype.updatePerformanceData = function (connection, taskName, values, timestamp) {
            var connectionGuid = connection.guid();
            if (!this.performanceData[connectionGuid]) {
                this.performanceData[connectionGuid] = [[], [], []];
            }
            var threeMinuesAgo = moment().add(-3, 'minutes');
            for (var i = 0; i < this.performanceData[connectionGuid].length; i++) {
                this.performanceData[connectionGuid][i] = $.grep(this.performanceData[connectionGuid][i], function (item, n) {
                    return moment(item.x).isAfter(threeMinuesAgo);
                });
            }
            this.performanceData[connectionGuid][0].push({ x: moment(timestamp).toDate(), y: values['0'] / 100.0 });
            this.performanceData[connectionGuid][1].push({ x: moment(timestamp).toDate(), y: values['1'] });
            this.performanceData[connectionGuid][2].push({ x: moment(timestamp).toDate(), y: values['2'] / 0.100 });
        };
        PerformanceTask.prototype.removePerformanceChart = function (connection) {
            var connectionGuid = connection.guid();
            var chartTargetId = 'chart-target-' + connectionGuid;
            if (this.charts[chartTargetId]) {
                this.charts[chartTargetId].detach();
                delete this.charts[chartTargetId];
            }
            $('#chart-container-' + connectionGuid).remove();
            delete this.performanceData[connectionGuid];
        };
        PerformanceTask.prototype.updatePerformanceChart = function (connection) {
            console.log('updatePerformanceChart', connection.name(), connection.guid());
            var series = [];
            var connectionGuid = connection.guid();
            for (var i = 0; i < this.performanceData[connectionGuid].length; i++) {
                if (this.performanceData[connectionGuid][i] != null)
                    series.push({
                        name: 'series' + i,
                        data: this.performanceData[connectionGuid][i]
                    });
            }
            var chartTargetId = 'chart-target-' + connectionGuid;
            var chartTarget = $('#' + chartTargetId);
            if (!chartTarget.length) {
                this.charts[chartTargetId] = this.createChart(connection, chartTargetId, { series: series });
            }
            else {
                this.charts[chartTargetId].data = { series: series };
                this.charts[chartTargetId].update();
            }
        };
        PerformanceTask.prototype.createChart = function (connection, chartTargetId, data) {
            var chartContainer = $('.chart-container', '.performance-task-template').clone();
            chartContainer.attr('id', 'chart-container-' + connection.guid());
            $('.name', chartContainer).text(connection.name());
            $('.uri', chartContainer).text(connection.uri());
            var chartTarget = $('.chart-target', chartContainer);
            chartTarget.attr('id', chartTargetId);
            $('.dashboard-container').append(chartContainer);
            var chart = new Chartist.Line('#' + chartTargetId, data, {
                showArea: true,
                showPoint: false,
                axisX: {
                    type: Chartist.FixedScaleAxis,
                    divisor: 6,
                    labelInterpolationFnc: function (value) {
                        return moment(value).format('HH:mm:ss');
                    }
                },
                axisY: {
                    type: Chartist.FixedScaleAxis,
                    high: 1,
                    low: 0,
                    ticks: [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1],
                    labelInterpolationFnc: function (value) {
                        return Math.round(value * 100) + ' %';
                    },
                },
            });
            return chart;
        };
        return PerformanceTask;
    })();
    Scoop.PerformanceTask = PerformanceTask;
})(Scoop || (Scoop = {}));

var Scoop;
(function (Scoop) {
    var ServerStatusTask = (function () {
        function ServerStatusTask() {
        }
        ServerStatusTask.prototype.init = function (hubProxy, connection) { };
        ServerStatusTask.prototype.onConnect = function (hubProxy) { };
        ServerStatusTask.prototype.onDisconnect = function (connection) { };
        return ServerStatusTask;
    })();
    Scoop.ServerStatusTask = ServerStatusTask;
})(Scoop || (Scoop = {}));

/// <reference path="../typings/select2/select2.d.ts" />
var stringToFunction = function (str) {
    var arr = str.split('.');
    var fn = (window || this);
    for (var i = 0, len = arr.length; i < len; i++) {
        fn = fn[arr[i]];
    }
    if (typeof fn !== 'function') {
        throw new Error('function not found: \'' + str + '\'');
    }
    return fn;
};
var UUID = (function () {
    var lut = [];
    for (var i = 0; i < 256; i++) {
        lut[i] = (i < 16 ? '0' : '') + (i).toString(16);
    }
    var self = {
        generate: function () {
            var d0 = Math.random() * 0xffffffff | 0;
            var d1 = Math.random() * 0xffffffff | 0;
            var d2 = Math.random() * 0xffffffff | 0;
            var d3 = Math.random() * 0xffffffff | 0;
            return lut[d0 & 0xff] + lut[d0 >> 8 & 0xff] + lut[d0 >> 16 & 0xff] + lut[d0 >> 24 & 0xff] + '-' +
                lut[d1 & 0xff] + lut[d1 >> 8 & 0xff] + '-' + lut[d1 >> 16 & 0x0f | 0x40] + lut[d1 >> 24 & 0xff] + '-' +
                lut[d2 & 0x3f | 0x80] + lut[d2 >> 8 & 0xff] + '-' + lut[d2 >> 16 & 0xff] + lut[d2 >> 24 & 0xff] +
                lut[d3 & 0xff] + lut[d3 >> 8 & 0xff] + lut[d3 >> 16 & 0xff] + lut[d3 >> 24 & 0xff];
        }
    };
    return self;
})();
var Scoop;
(function (Scoop) {
})(Scoop || (Scoop = {}));
$(function () {
    ko.bindingHandlers.select2 = new function () {
        this.init = function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var options = valueAccessor();
            var el = $(element);
            el.select2(options);
            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                el.select2('destroy');
            });
        },
            this.update = function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                allBindings().selectedOptions();
                $(element).trigger('change');
            };
    };
    var connectionService = new Scoop.ConnectionService();
    var connectionViewModel = new Scoop.ConnectionViewModel(connectionService);
    ko.applyBindings(connectionViewModel);
});