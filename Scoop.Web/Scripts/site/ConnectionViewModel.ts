module Scoop {
    export class ConnectionViewModel {
        private connectionService: ConnectionService;

        connections: KnockoutObservableArray<IConnection>;
        newConnection: IConnection;
        tasksCache: ITasksCache;

        constructor(connectionService: ConnectionService) {
            this.connectionService = connectionService;

            this.newConnection = ko.viewmodel.fromModel({
                uri: '',
                name: '',
                autoConnect: false,
            });

            this.connections = ko.observableArray<IConnection>([]);
            this.tasksCache = {};

            this.updateConnections();
        }

        private updateConnections = () => {
            this.connectionService.getConnections()
                .done((data, textStatus, jqXhr) => {
                var connections = <KnockoutObservableArray<IConnection>>ko.viewmodel.fromModel(data,
                    {
                        extend: {
                            '{root}[i]': (item: IConnection) => {
                                item.isConnected = ko.observable(false);
                                item.currentHubConnection = null;
                                item.chosenTasks = ko.observableArray<ITask>([]);
                            }
                        }
                    }
                    );
                this.connections.remove((currentConnection) => {
                    return $.grep(connections(),(connection, n) => { return connection.guid() == currentConnection.guid() }).length == 0;
                });

                $.each(connections(),(i, connection) => {
                    this.connectionService.getAvailableTasks(connection)
                        .done((tasks, textStatus, jqXhr) => {

                        var taskInstances = $.map(tasks,(task) => {
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

                        var existingConnections = $.grep(this.connections(),(currentConnection, n) => {
                            return currentConnection.guid() == connection.guid();
                        });
                        if (existingConnections.length) {
                            $.each(existingConnections,(n, existingConnection) => {
                                existingConnection.autoConnect(connection.autoConnect());
                                existingConnection.name(connection.name());
                                existingConnection.uri(connection.uri());
                                existingConnection.availableTasks = availableTasks;
                                existingConnection.chosenTasks = ko.observableArray($.map(existingConnection.chosenTasks(),(chosenTask) => {
                                    return $.grep(availableTasks(),(availableTask, k) => { return availableTask.guid == chosenTask.guid; }).length
                                        ? chosenTask
                                        : null;
                                }));
                            });
                        } else {
                            connection.availableTasks = availableTasks;
                            connection.chosenTasks = availableTasks;
                            this.connections.push(connection);
                        }
                    });
                });
            });
        }

        addConnection = () => {
            console.log('addConnection', this.newConnection.uri());
            this.connectionService.addConnection(this.newConnection)
                .done(() => {
                this.updateConnections();
            });
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
    }
} 