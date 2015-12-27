module Scoop {
    export class ConnectionService {
        private connectionCookieName = 'connections';

        //addConnection(connection: IConnection): JQueryPromise<IStatusResponse> {
        //    var formData = new FormData();

        //    formData.append('connection.name', connection.name());
        //    formData.append('connection.uri', connection.uri());
        //    formData.append('connection.autoConnect', connection.autoConnect());
        //    formData.append('__RequestVerificationToken', $('input[name=__RequestVerificationToken]').val());

        //    return $.ajax({
        //        url: '/Connection/Add',
        //        method: 'POST',
        //        cache: false,
        //        contentType: false,
        //        processData: false,
        //        data: formData
        //    });
        //}

        storeConnection(connection: IConnection) {
            if (connection.guid() == null) {
                connection.guid(UUID.generate());
            }

            var connectionsSerializable = <IConnectionSerializable[]>Cookies.getJSON(this.connectionCookieName) || [];

            var guid = connection.guid();
            connectionsSerializable = connectionsSerializable.filter((item) => {
                return item.guid != guid;
            });

            var connectionSerializable = this.toSerializable(connection);
            connectionsSerializable.push(connectionSerializable);

            this.storeCookie(connectionsSerializable);
        }

        removeConnectionFromStore(connection: IConnection) {
            var connectionsSerializable = <IConnectionSerializable[]>Cookies.getJSON(this.connectionCookieName) || [];

            var guid = connection.guid();
            connectionsSerializable = connectionsSerializable.filter((item) => {
                return item.guid != guid;
            });

            this.storeCookie(connectionsSerializable);
        }

        storeCookie(connectionsSerializable: IConnectionSerializable[]) {
            var expires = moment().add(1, 'year').toDate();
            Cookies.set(this.connectionCookieName, connectionsSerializable, { expires: expires });
        }

        //getConnections(): JQueryPromise<IConnection[]> {
        //    return $.ajax({
        //        url: '/Connection/List',
        //        method: 'GET'
        //    });
        //}

        getConnectionsFromStore(): IConnectionSerializable[] {
            var connectionsSerializable = <IConnectionSerializable[]>Cookies.getJSON(this.connectionCookieName) || [];

            return connectionsSerializable;
        }

        getAvailableTasks(connectionUri: string): JQueryPromise<ITask[]> {
            return $.ajax({
                url: connectionUri + '/AvailableTasks',
                method: 'GET',
                cache: false
            });
        }

        connect(connection: IConnection) {
            this.disconnect(connection);
            console.log('connect', connection.guid());
            connection.currentHubConnection = $.hubConnection(connection.uri());

            var onConnectionStart = $.Deferred();
            $.each(connection.chosenTasks(), (i, task) => {
                var hubProxy = null;
                if (task.hubName != null) {
                    hubProxy = connection.currentHubConnection.createHubProxy(task.hubName);
                    onConnectionStart.done(() => {
                        task.onConnect(hubProxy);
                    });
                }
                task.init(hubProxy, connection);
            });

            connection.currentHubConnection.logging = false;
            var connectionStart = connection.currentHubConnection.start();

            connectionStart.done(() => {
                onConnectionStart.resolve();
            });

            return connectionStart;
        }

        disconnect(connection: IConnection) {
            if (connection.chosenTasks != null) {
                $.each(connection.chosenTasks(), (i, task) => {
                    task.onDisconnect(connection);
                });
            }

            if (connection.currentHubConnection)
                connection.currentHubConnection.stop();

            connection.currentHubConnection = null;
        }

        toSerializable(connection: IConnection): IConnectionSerializable {
            return <IConnectionSerializable>{
                guid: connection.guid(),
                uri: connection.uri(),
                name: connection.name(),
                autoConnect: connection.autoConnect(),
                isConnected: connection.isConnected(),
                hasConnectionProblem: connection.hasConnectionProblem(),
                connectionMessage: connection.connectionMessage()
            };
        }

        static fromSerializable(connectionSerializable: IConnectionSerializable): IConnection {
            var connection = ko.viewmodel.fromModel(connectionSerializable);

            if (!connectionSerializable.hasOwnProperty('hasConnectionProblem'))
                connection.hasConnectionProblem = ko.observable<boolean>();

            if (!connectionSerializable.hasOwnProperty('connectionMessage'))
                connection.connectionMessage = ko.observable<string>();

            connection.availableTasks = ko.observableArray<ITask>();
            connection.isConnected = ko.observable<boolean>();

            return connection;
        }

        static clone(connection: IConnection): IConnection {
            return <IConnection>{
                guid: ko.observable<string>(connection.guid()),
                uri: ko.observable<string>(connection.uri()),
                name: ko.observable<string>(connection.name()),
                autoConnect: ko.observable<boolean>(connection.autoConnect()),
                isConnected: ko.observable<boolean>(connection.isConnected()),
                hasConnectionProblem: ko.observable<boolean>(connection.hasConnectionProblem()),
                connectionMessage: ko.observable<string>(connection.connectionMessage())
            };
        }
    }
}