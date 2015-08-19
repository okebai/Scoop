module Scoop {
    export class ConnectionService {
        addConnection(connection: IConnection): JQueryPromise<IStatusResponse> {
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
        }

        getConnections(): JQueryPromise<IConnection[]> {
            return $.ajax({
                url: '/Connection/List',
                method: 'GET'
            });
        }

        getAvailableTasks(connection: IConnection): JQueryPromise<ITask[]> {
            return $.ajax({
                url: connection.uri() + '/AvailableTasks',
                method: 'GET',
                cache: false
            });
        }

        connect(connection: IConnection) {
            this.disconnect(connection);
            console.log('connect', connection.guid());
            var hubConnection = $.hubConnection(connection.uri());

            var onConnectionStart = $.Deferred();
            $.each(connection.chosenTasks(),(i, task) => {
                var hubProxy = null;
                if (task.hubName != null) {
                    hubProxy = hubConnection.createHubProxy(task.hubName);
                    onConnectionStart.done(() => { task.onConnect(hubProxy); });
                }
                task.init(hubProxy, connection);
            });

            hubConnection.logging = false;
            var connectionStart = hubConnection.start();

            connectionStart.done(() => {
                connection.currentHubConnection = hubConnection;

                onConnectionStart.resolve();
            });

            return connectionStart;
        }

        disconnect(connection: IConnection) {
            $.each(connection.chosenTasks(),(i, task) => {
                task.onDisconnect(connection);
            });

            if (connection.currentHubConnection)
                connection.currentHubConnection.stop();

            connection.currentHubConnection = null;
        }
    }
}