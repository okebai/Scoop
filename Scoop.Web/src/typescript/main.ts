/// <reference path="../vendor/typings/knockout/knockout.d.ts" />
/// <reference path="../vendor/typings/signalr/signalr.d.ts" />
/// <reference path="../vendor/typings/moment/moment.d.ts" />
/// <reference path="../vendor/typings/js-cookie/js-cookie.d.ts" />
/// <reference path="../vendor/typings/knockout.viewmodel/knockout.viewmodel.d.ts" />
/// <reference path="../vendor/typings/select2/select2.d.ts" />
/// <reference path="../vendor/typings/bootstrap-material.design/bootstrap-material-design.d.ts" />

var stringToFunction = function (str) {
    var arr = str.split('.');

    var fn = (window || this);
    for (var i = 0, len = arr.length; i < len; i++) {
        fn = fn[arr[i]];
    }

    if (typeof fn !== 'function') {
        throw new Error('function not found: \'' + str + '\'');
    }

    return fn;
};

/**
 * Fast UUID generator, RFC4122 version 4 compliant.
 * @author Jeff Ward (jcward.com).
 * @license MIT license
 * @link http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/21963136#21963136
 **/
var UUID = (() => {
    var lut = []; for (var i = 0; i < 256; i++) { lut[i] = (i < 16 ? '0' : '') + (i).toString(16); }
    var self = {
        generate: () => {
            var d0 = Math.random() * 0xffffffff | 0;
            var d1 = Math.random() * 0xffffffff | 0;
            var d2 = Math.random() * 0xffffffff | 0;
            var d3 = Math.random() * 0xffffffff | 0;
            return lut[d0 & 0xff] + lut[d0 >> 8 & 0xff] + lut[d0 >> 16 & 0xff] + lut[d0 >> 24 & 0xff] + '-' +
                lut[d1 & 0xff] + lut[d1 >> 8 & 0xff] + '-' + lut[d1 >> 16 & 0x0f | 0x40] + lut[d1 >> 24 & 0xff] + '-' +
                lut[d2 & 0x3f | 0x80] + lut[d2 >> 8 & 0xff] + '-' + lut[d2 >> 16 & 0xff] + lut[d2 >> 24 & 0xff] +
                lut[d3 & 0xff] + lut[d3 >> 8 & 0xff] + lut[d3 >> 16 & 0xff] + lut[d3 >> 24 & 0xff];
        }
    };
    return self;
})();

module Scoop {
    declare var Chartist: any;

    export interface ITask {
        guid: string;
        name: string;
        friendlyName: string;
        hubName: string;

        init: (hubProxy: HubProxy, connection: IConnection) => void;
        onConnect: (hubProxy: HubProxy) => void;
        onDisconnect: (connection: IConnection) => void;
    }

    export interface ITasksCache {
        [guid: string]: KnockoutObservable<ITask>;
    }

    export interface IConnection {
        guid: KnockoutObservable<string>;
        uri: KnockoutObservable<string>;
        name: KnockoutObservable<string>;
        autoConnect: KnockoutObservable<boolean>;

        isConnected: KnockoutObservable<boolean>;
        hasConnectionProblem: KnockoutObservable<boolean>;
        connectionMessage: KnockoutObservable<string>;
        currentHubConnection: HubConnection;
        availableTasks: KnockoutObservableArray<ITask>;
        chosenTasks: KnockoutObservableArray<ITask>;
    }

    export interface IConnectionSerializable {
        guid: string;
        uri: string;
        name: string;
        autoConnect: boolean;

        isConnected: boolean;
        hasConnectionProblem: boolean;
        connectionMessage: string;
    }

    export interface IStatusResponse {
        success: boolean;
        payload: any;
    }

    export interface ITaskResultValue {
        [key: string]: number;
    }

    export interface ITaskResultMessage {
        [key: string]: string;
    }

    export interface ITaskResult {
        values: ITaskResultValue[];
        messages: ITaskResultValue[];
        timeStamp: string;
        taskName: string;
   }

    export interface IPerformanceData {
        [guid: string]: IPerformanceItem[][];
    }

    export interface IPerformanceItem {
        x: Date;
        y: number;
    }

    export interface IChartistChart {
        detach: () => void;
        update: () => void;
        data: any;
    }

    export interface IChartHolder {
        [chartTargetId: string]: IChartistChart;
    }
}

$(() => {
    $.material.init();

    var connectionService = new Scoop.ConnectionService();
    var connectionViewModel = new Scoop.ConnectionViewModel(connectionService);

    ko.applyBindings(connectionViewModel, $('#connectModal')[0]);
});