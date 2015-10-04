module Scoop {
    export class ConnectionViewModel {
        private connectionService: ConnectionService;

        connections: KnockoutObservableArray<IConnection>;
        newConnection: IConnection;
        tasksCache: ITasksCache;

        constructor(connectionService: ConnectionService) {
            this.connectionService = connectionService;

            this.resetNewConnection();

            this.connections = ko.observableArray<IConnection>([]);
            this.tasksCache = {};

            this.updateAllConnectionsFromStore();
        }

        private resetNewConnection() {
            if (this.newConnection) {
                this.newConnection.guid(null);
                this.newConnection.uri('');
                this.newConnection.name('');
                this.newConnection.autoConnect(false);
                this.newConnection.isConnected(false);
                this.newConnection.hasConnectionProblem(false);
                this.newConnection.connectionProblemMessage(null);
            } else {
                this.newConnection = ko.viewmodel.fromModel(<IConnectionSerializable>{
                    guid: null,
                    uri: '',
                    name: '',
                    autoConnect: false,
                    isConnected: false,
                    hasConnectionProblem: false,
                    connectionProblemMessage: ''
                });
            }
        }

        private updateAllConnectionsFromStore = () => {
            var connectionsSerializable = this.connectionService.getConnectionsFromStore();

            this.connections.remove((currentConnection) => {
                return $.grep(connectionsSerializable, (connection, n) => { return connection.guid == currentConnection.guid() }).length == 0;
            });

            $.each(connectionsSerializable, (i, connectionSerializable) => {
                this.connectionService.getAvailableTasks(connectionSerializable.uri)
                    .done((tasks, textStatus, jqXhr) => {

                        var taskInstances = $.map(tasks, (task) => {
                            var taskInstance = null;
                            if (this.tasksCache[task.guid]) {
                                taskInstance = this.tasksCache[task.guid];
                            } else if (task.name != null) {
                                var taskClass = stringToFunction('Scoop.' + task.name);
                                if (taskClass)
                                    taskInstance = <ITask>new taskClass();
                            }

                            return taskInstance;
                        });

                        var availableTasks = <KnockoutObservableArray<ITask>>ko.observableArray(taskInstances);

                        var existingConnections = $.grep(this.connections(), (currentConnection, n) => {
                            return currentConnection.guid() == connectionSerializable.guid;
                        });

                        if (existingConnections.length) {
                            $.each(existingConnections, (n, existingConnection) => {
                                existingConnection.autoConnect(connectionSerializable.autoConnect);
                                existingConnection.name(connectionSerializable.name);
                                existingConnection.uri(connectionSerializable.uri);
                                existingConnection.availableTasks = availableTasks;
                                existingConnection.chosenTasks = ko.observableArray($.map(existingConnection.chosenTasks(), (chosenTask) => {
                                    return $.grep(availableTasks(), (availableTask, k) => { return availableTask.guid == chosenTask.guid; }).length
                                        ? chosenTask
                                        : null;
                                }));
                                existingConnection.hasConnectionProblem(false);
                                existingConnection.connectionProblemMessage(null);

                                if (existingConnection.autoConnect())
                                    this.connect(existingConnection);
                            });
                        } else {
                            var connection = ConnectionService.fromSerializable(connectionSerializable);
                            connection.availableTasks = availableTasks;
                            connection.chosenTasks = availableTasks;
                            this.connections.push(connection);
                            console.log(connection.uri());
                            if (connection.autoConnect())
                                this.connect(connection);
                        }
                    })
                    .fail((jqXhr, textStatus, errorThrown) => {
                        var existingConnections = $.grep(this.connections(), (currentConnection, n) => {
                            return currentConnection.guid() == connectionSerializable.guid;
                        });

                        if (existingConnections.length) {
                            $.each(existingConnections, (n, existingConnection) => {
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
                        } else {
                            var connection = ConnectionService.fromSerializable(connectionSerializable);
                            connection.availableTasks = ko.observableArray<ITask>();
                            connection.chosenTasks = ko.observableArray<ITask>();
                            connection.hasConnectionProblem(true);
                            if (jqXhr.status == 0)
                                connection.connectionProblemMessage('Network error. Please check console for details.');
                            else
                                connection.connectionProblemMessage(jqXhr.status + ' ' + errorThrown);
                            this.connections.push(connection);
                        }
                    });
            });
        }

        private addOrUpdateConnection = (connection: IConnection): JQueryPromise<ITask[]> => {
            var existingConnections = $.grep(this.connections(), (currentConnection, n) => {
                return currentConnection.guid() == connection.guid();
            });

            return this.connectionService.getAvailableTasks(connection.uri())
                .done((tasks, textStatus, jqXhr) => {
                    var taskInstances = $.map(tasks, (task) => {
                        var taskInstance = null;
                        if (this.tasksCache[task.guid]) {
                            taskInstance = this.tasksCache[task.guid];
                        } else if (task.name != null) {
                            var taskClass = stringToFunction('Scoop.' + task.name);
                            if (taskClass)
                                taskInstance = <ITask>new taskClass();
                        }

                        return taskInstance;
                    });

                    var availableTasks = <KnockoutObservableArray<ITask>>ko.observableArray(taskInstances);

                    if (existingConnections.length) {
                        $.each(existingConnections, (n, existingConnection) => {
                            existingConnection.autoConnect(connection.autoConnect());
                            existingConnection.name(connection.name());
                            existingConnection.uri(connection.uri());
                            existingConnection.availableTasks = availableTasks;
                            existingConnection.chosenTasks = ko.observableArray($.map(existingConnection.chosenTasks(), (chosenTask) => {
                                return $.grep(availableTasks(), (availableTask, k) => { return availableTask.guid == chosenTask.guid; }).length
                                    ? chosenTask
                                    : null;
                            }));
                            existingConnection.hasConnectionProblem(false);
                            existingConnection.connectionProblemMessage(null);
                            this.connectionService.storeConnection(existingConnection);
                            if (existingConnection.autoConnect())
                                this.connect(existingConnection);
                        });
                    } else {
                        var newConnection = ConnectionService.clone(connection);
                        newConnection.availableTasks = availableTasks;
                        newConnection.chosenTasks = availableTasks;
                        this.connections.push(newConnection);
                        this.connectionService.storeConnection(newConnection);
                        if (newConnection.autoConnect())
                            this.connect(newConnection);
                    }
                })
                .fail((jqXhr, textStatus, errorThrown) => {
                    if (existingConnections.length) {
                        $.each(existingConnections, (n, existingConnection) => {
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
                            this.connectionService.storeConnection(existingConnection);
                        });
                    } else {
                        var newConnection = ConnectionService.clone(connection);
                        newConnection.hasConnectionProblem(true);
                        if (jqXhr.status == 0)
                            newConnection.connectionProblemMessage("Network error. Please check console for details.");
                        else
                            newConnection.connectionProblemMessage(jqXhr.status + ' ' + errorThrown);
                        this.connections.push(newConnection);
                        this.connectionService.storeConnection(newConnection);
                    }
                });
        }

        addConnection = () => {
            console.log('addConnection', this.newConnection.uri());

            this.addOrUpdateConnection(this.newConnection)
                .done(() => {
                    this.resetNewConnection();
                })
                .fail((jqXhr, textStatus, errorThrown) => {

                });
        }

        removeConnection = (connection: IConnection) => {
            console.log('removeConnection', connection.uri());

            if (connection.isConnected())
                this.disconnect(connection);

            this.connections.remove(connection);
            this.connectionService.removeConnectionFromStore(connection);
        }

        connect = (connection: IConnection) => {
            console.log('connect', connection);

            this.connectionService.connect(connection)
                .done(() => {
                    connection.isConnected(true);
                });
        }

        disconnect = (connection: IConnection) => {
            console.log('disconnect');

            this.connectionService.disconnect(connection);
            connection.isConnected(false);
        }

        enableAutoConnect = (connection: IConnection) => {
            console.log('enableAutoConnect');

            connection.autoConnect(true);
            this.connectionService.storeConnection(connection);

            this.connect(connection);
        }

        disableAutoConnect = (connection: IConnection) => {
            console.log('disableAutoConnect');

            connection.autoConnect(false);
            this.connectionService.storeConnection(connection);
        }
    }
} 