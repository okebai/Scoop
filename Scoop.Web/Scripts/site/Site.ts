/// <reference path="../typings/select2/select2.d.ts" />

var stringToFunction = function (str) {
    var arr = str.split('.');

    var fn = (window || this);
    for (var i = 0, len = arr.length; i < len; i++) {
        fn = fn[arr[i]];
    }

    if (typeof fn !== 'function') {
        throw new Error('function not found');
    }

    return fn;
};

interface KnockoutBindingHandlers {
    select2: KnockoutBindingHandler;
}


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
        currentHubConnection: HubConnection;
        availableTasks: KnockoutObservableArray<ITask>;
        chosenTasks: KnockoutObservableArray<ITask>;
    }

    export interface IStatusResponse {
        success: boolean;
        payload: any;
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
    ko.bindingHandlers.select2 = new function () {
        this.init = (element, valueAccessor, allBindings, viewModel, bindingContext) => {
            var options = valueAccessor();

            var el = $(element);

            el.select2(options);

            ko.utils.domNodeDisposal.addDisposeCallback(element,() => {
                el.select2('destroy');
            });
        },
        this.update = (element, valueAccessor, allBindings, viewModel, bindingContext) => {
            allBindings().selectedOptions();

            $(element).trigger('change');
        }
    };

    var connectionService = new Scoop.ConnectionService();
    var connectionViewModel = new Scoop.ConnectionViewModel(connectionService);

    ko.applyBindings(connectionViewModel);
});