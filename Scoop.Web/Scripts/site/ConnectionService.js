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
//# sourceMappingURL=ConnectionService.js.map