var Scoop;
(function (Scoop) {
    var ConnectionService = (function () {
        function ConnectionService() {
        }
        ConnectionService.prototype.addConnection = function (connection) {
            var formData = new FormData();
            formData.append('connection.name', connection.name());
            formData.append('connection.uri', connection.uri());
            formData.append('connection.autoConnect', connection.autoConnect());
            formData.append('__RequestVerificationToken', $('input[name=__RequestVerificationToken]').val());
            return $.ajax({
                url: '/Connection/Add',
                method: 'POST',
                cache: false,
                contentType: false,
                processData: false,
                data: formData
            });
        };
        ConnectionService.prototype.getConnections = function () {
            return $.ajax({
                url: '/Connection/List',
                method: 'GET'
            });
        };
        ConnectionService.prototype.getAvailableTasks = function (connection) {
            return $.ajax({
                url: connection.uri() + '/AvailableTasks',
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
        return ConnectionService;
    })();
    Scoop.ConnectionService = ConnectionService;
})(Scoop || (Scoop = {}));

var Scoop;
(function (Scoop) {
    var ConnectionViewModel = (function () {
        function ConnectionViewModel(connectionService) {
            var _this = this;
            this.updateConnections = function () {
                _this.connectionService.getConnections()
                    .done(function (data, textStatus, jqXhr) {
                    var connections = ko.viewmodel.fromModel(data, {
                        extend: {
                            '{root}[i]': function (item) {
                                item.isConnected = ko.observable(false);
                                item.currentHubConnection = null;
                                item.chosenTasks = ko.observableArray([]);
                            }
                        }
                    });
                    _this.connections.remove(function (currentConnection) {
                        return $.grep(connections(), function (connection, n) { return connection.guid() == currentConnection.guid(); }).length == 0;
                    });
                    $.each(connections(), function (i, connection) {
                        _this.connectionService.getAvailableTasks(connection)
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
                                return currentConnection.guid() == connection.guid();
                            });
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
                                });
                            }
                            else {
                                connection.availableTasks = availableTasks;
                                connection.chosenTasks = availableTasks;
                                _this.connections.push(connection);
                            }
                        });
                    });
                });
            };
            this.addConnection = function () {
                console.log('addConnection', _this.newConnection.uri());
                _this.connectionService.addConnection(_this.newConnection)
                    .done(function () {
                    _this.updateConnections();
                });
            };
            this.connect = function (connection) {
                console.log('connect', connection);
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
            this.connectionService = connectionService;
            this.newConnection = ko.viewmodel.fromModel({
                uri: '',
                name: '',
                autoConnect: false,
            });
            this.connections = ko.observableArray([]);
            this.tasksCache = {};
            this.updateConnections();
        }
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
            console.log('updatePerformanceChart', connection.guid());
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
                this.charts[chartTargetId] = this.createChart(connectionGuid, chartTargetId, { series: series });
            }
            else {
                this.charts[chartTargetId].data = { series: series };
                this.charts[chartTargetId].update();
            }
        };
        PerformanceTask.prototype.createChart = function (connectionGuid, chartTargetId, data) {
            var chartContainer = $('.chart-container', '.performance-task-template').clone();
            chartContainer.attr('id', 'chart-container-' + connectionGuid);
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

/// <reference path="../typings/select2/select2.d.ts" />
var stringToFunction = function (str) {
    var arr = str.split('.');
    var fn = (window || this);
    for (var i = 0, len = arr.length; i < len; i++) {
        fn = fn[arr[i]];
    }
    if (typeof fn !== 'function') {
        throw new Error('function not found');
    }
    return fn;
};
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