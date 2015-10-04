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
