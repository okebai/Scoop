module Scoop {
    export class AutoUpdateTask implements ITask {
        guid;
        name;
        friendlyName;
        hubName;

        init(hubProxy: HubProxy, connection: IConnection) { }

        onConnect(hubProxy: HubProxy) { }

        onDisconnect(connection: IConnection) { }
    }
} 