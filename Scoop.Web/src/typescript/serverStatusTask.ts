module Scoop {
    export class ServerStatusTask implements ITask {
        guid: string;
        name: string;
        friendlyName: string;
        hubName: string;

        init(hubProxy: HubProxy, connection: IConnection) { }

        onConnect(hubProxy: HubProxy) { }

        onDisconnect(connection: IConnection) { }
    }
} 