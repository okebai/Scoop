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
