declare var Chartist: any;

module Scoop {
    export class PerformanceTask implements ITask {
        guid;
        name;
        friendlyName;
        hubName = 'performanceHub';
        charts: IChartHolder = {};
        performanceData: IPerformanceData = {};
        pendingConnectionSlowReset = false;

        init(hubProxy: HubProxy, connection: IConnection) {
            var connectionGuid = connection.guid();
            var chartTargetId = 'chart-target-' + connectionGuid;
            this.initWidget(connection, chartTargetId);

            if (hubProxy != null) {
                hubProxy.on('updatePerformance', (taskName, values, timestamp) => {
                    this.updatePerformanceData(connection, taskName, values, timestamp);
                    this.updatePerformanceChart(connection);
                });

                hubProxy.on('updatePerformanceHistory', taskResultHistory => {
                    this.clearPerformanceData(connection);
                    for (var i = 0; i < taskResultHistory.length; i++) {
                        var taskResult = taskResultHistory[i];
                        this.updatePerformanceData(connection, taskResult.Name, taskResult.Values, taskResult.Timestamp);
                    }
                    this.updatePerformanceChart(connection);
                });
            }

            this.onConnectionSlow(connection);
            this.onConnectionStateChange(connection);
        }

        onConnect(hubProxy: HubProxy) {
            if (hubProxy != null) {
                hubProxy.invoke('GetPerformanceHistory');
            }
        }

        onDisconnect(connection: IConnection) {
            this.removePerformanceChart(connection);
        }

        onConnectionSlow(connection: IConnection) {
            connection.currentHubConnection.connectionSlow(() => {
                connection.hasConnectionProblem(true);
                connection.connectionMessage('Connection is slow...');

                this.pendingConnectionSlowReset = true;
                setTimeout(() => {
                    if (this.pendingConnectionSlowReset)
                        connection.connectionMessage('');
                }, 10000);
            });
        }

        onConnectionStateChange(connection: IConnection) {
            connection.currentHubConnection.stateChanged((change: SignalRStateChange) => {
                this.pendingConnectionSlowReset = false;

                switch (change.newState) { // connecting: 0, connected: 1, reconnecting: 2, disconnected: 4
                    case $.signalR.connectionState.connecting:
                        connection.hasConnectionProblem(false);
                        connection.connectionMessage('Connecting...');
                        break;
                    case $.signalR.connectionState.reconnecting:
                        connection.hasConnectionProblem(true);
                        connection.connectionMessage('Reconnecting...');
                        break;
                    case $.signalR.connectionState.connected:
                        connection.hasConnectionProblem(false);
                        connection.connectionMessage('Connected');

                        setTimeout(() => {
                            if (!connection.hasConnectionProblem())
                                connection.connectionMessage('');
                        }, 5000);
                        break;
                    case $.signalR.connectionState.disconnected:
                        connection.hasConnectionProblem(true);
                        connection.connectionMessage('Disconnected');
                        break;
                }
            });
        }

        private clearPerformanceData(connection: IConnection) {
            delete this.performanceData[connection.guid()];
        }

        private updatePerformanceData(connection: IConnection, taskName: string, values, timestamp) {
            var connectionGuid = connection.guid();
            if (!this.performanceData[connectionGuid]) {
                this.performanceData[connectionGuid] = [[], [], []];
            }

            var threeMinuesAgo = moment().add(-3, 'minutes');
            for (var i = 0; i < this.performanceData[connectionGuid].length; i++) {
                this.performanceData[connectionGuid][i] = $.grep(this.performanceData[connectionGuid][i], (item: IPerformanceItem, n) =>
                    moment(item.x).isAfter(threeMinuesAgo)
                );
            }

            this.performanceData[connectionGuid][0].push({ x: moment(timestamp).toDate(), y: values['0'] / 100.0 });
            this.performanceData[connectionGuid][1].push({ x: moment(timestamp).toDate(), y: values['1'] });
            this.performanceData[connectionGuid][2].push({ x: moment(timestamp).toDate(), y: values['2'] / 0.100 });
        }

        private removePerformanceChart(connection: IConnection) {
            var connectionGuid = connection.guid();
            var chartTargetId = 'chart-target-' + connectionGuid;

            if (this.charts[chartTargetId]) {
                this.charts[chartTargetId].detach();
                delete this.charts[chartTargetId];
            }

            $('#chart-container-' + connectionGuid).remove();

            delete this.performanceData[connectionGuid];
        }

        private updatePerformanceChart(connection: IConnection) {
            //console.log('updatePerformanceChart', connection.name(), connection.guid());
            var series = [];
            var connectionGuid = connection.guid();

            if (this.performanceData[connectionGuid] != null) {
                for (var i = 0; i < this.performanceData[connectionGuid].length; i++) {
                    if (this.performanceData[connectionGuid][i] != null)
                        series.push({
                            name: 'series' + i,
                            data: this.performanceData[connectionGuid][i]
                        });
                }
            }

            var chartTargetId = 'chart-target-' + connectionGuid;
            if (this.charts[chartTargetId] == null) {
                this.charts[chartTargetId] = this.createChart(connection, chartTargetId, { series: series });
            } else {
                this.charts[chartTargetId].data = { series: series };
                this.charts[chartTargetId].update();
            }
        }

        private initWidget(connection: IConnection, chartTargetId) {
            var chartContainer = $('.chart-container', '.performance-task-template').clone();
            chartContainer.attr('id', 'chart-container-' + connection.guid());

            var chartTarget = $('.chart-target', chartContainer);
            chartTarget.attr('id', chartTargetId);

            $('#dashboardContainerMiddle').append(chartContainer);

            $(() => {
                ko.applyBindings(connection, chartContainer[0]);
            });
        }

        private createChart(connection: IConnection, chartTargetId, data) {
            var chart = new Chartist.Line('#' + chartTargetId, data,
                {
                    showArea: true,
                    showPoint: false,
                    fullWidth: true,
                    axisX:
                    {
                        type: Chartist.FixedScaleAxis,
                        divisor: 6,
                        labelInterpolationFnc(value) {
                            return moment(value).format('HH:mm:ss');
                        }
                    },
                    axisY:
                    {
                        type: Chartist.FixedScaleAxis,
                        high: 1,
                        low: 0,
                        ticks: [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1],
                        labelInterpolationFnc(value) {
                            return Math.round(value * 100) + ' %';
                        },
                    },
                });

            return chart;
        }
    }
} 