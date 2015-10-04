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
