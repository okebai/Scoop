module Scoop {
    export class ServerStatusTask implements ITask {
        guid;
        name;
        friendlyName;
        hubName;

        init(hubProxy: HubProxy, connection: IConnection) { }

        onConnect(hubProxy: HubProxy) { }

        onDisconnect(connection: IConnection) { }
    }
} 