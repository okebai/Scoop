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
//# sourceMappingURL=ConnectionViewModel.js.map