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
