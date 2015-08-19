declare var Chartist: any;
module Scoop {
    export class PerformanceTask implements ITask {
        guid;
        name;
        friendlyName;
        hubName = 'performanceHub';
        charts: IChartHolder = {};
        performanceData: IPerformanceData = {};

        init(hubProxy: HubProxy, connection: IConnection) {
            if (hubProxy != null) {
                hubProxy.on('updatePerformance',(taskName, values, timestamp) => {
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
        }

        onConnect(hubProxy: HubProxy) {
            if (hubProxy != null)
                hubProxy.invoke('GetPerformanceHistory');
        }

        onDisconnect(connection: IConnection) {
            this.removePerformanceChart(connection);
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
                this.performanceData[connectionGuid][i] = $.grep(this.performanceData[connectionGuid][i],(item: IPerformanceItem, n) =>
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
            console.log('updatePerformanceChart', connection.guid());
            var series = [];
            var connectionGuid = connection.guid();
            for (var i = 0; i < this.performanceData[connectionGuid].length; i++) {
                if (this.performanceData[connectionGuid][i] != null)
                    series.push({
                        name: 'series' + i,
                        data: this.performanceData[connectionGuid][i]
                    });
            }

            var chartTargetId = 'chart-target-' + connectionGuid;
            var chartTarget = $('#' + chartTargetId);
            if (!chartTarget.length) {
                this.charts[chartTargetId] = this.createChart(connectionGuid, chartTargetId, { series: series });
            } else {
                this.charts[chartTargetId].data = { series: series };
                this.charts[chartTargetId].update();
            }
        }

        private createChart(connectionGuid, chartTargetId, data) {
            var chartContainer = $('.chart-container', '.performance-task-template').clone();
            chartContainer.attr('id', 'chart-container-' + connectionGuid);

            var chartTarget = $('.chart-target', chartContainer);
            chartTarget.attr('id', chartTargetId);

            $('.dashboard-container').append(chartContainer);

            var chart = new Chartist.Line('#' + chartTargetId, data,
                {
                    showArea: true,
                    showPoint: false,
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