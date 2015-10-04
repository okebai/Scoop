var Scoop;
(function (Scoop) {
    var PerformanceTask = (function () {
        function PerformanceTask() {
            this.hubName = 'performanceHub';
            this.charts = {};
            this.performanceData = {};
        }
        PerformanceTask.prototype.init = function (hubProxy, connection) {
            var _this = this;
            if (hubProxy != null) {
                hubProxy.on('updatePerformance', function (taskName, values, timestamp) {
                    _this.updatePerformanceData(connection, taskName, values, timestamp);
                    _this.updatePerformanceChart(connection);
                });
                hubProxy.on('updatePerformanceHistory', function (taskResultHistory) {
                    _this.clearPerformanceData(connection);
                    for (var i = 0; i < taskResultHistory.length; i++) {
                        var taskResult = taskResultHistory[i];
                        _this.updatePerformanceData(connection, taskResult.Name, taskResult.Values, taskResult.Timestamp);
                    }
                    _this.updatePerformanceChart(connection);
                });
            }
        };
        PerformanceTask.prototype.onConnect = function (hubProxy) {
            if (hubProxy != null)
                hubProxy.invoke('GetPerformanceHistory');
        };
        PerformanceTask.prototype.onDisconnect = function (connection) {
            this.removePerformanceChart(connection);
        };
        PerformanceTask.prototype.clearPerformanceData = function (connection) {
            delete this.performanceData[connection.guid()];
        };
        PerformanceTask.prototype.updatePerformanceData = function (connection, taskName, values, timestamp) {
            var connectionGuid = connection.guid();
            if (!this.performanceData[connectionGuid]) {
                this.performanceData[connectionGuid] = [[], [], []];
            }
            var threeMinuesAgo = moment().add(-3, 'minutes');
            for (var i = 0; i < this.performanceData[connectionGuid].length; i++) {
                this.performanceData[connectionGuid][i] = $.grep(this.performanceData[connectionGuid][i], function (item, n) {
                    return moment(item.x).isAfter(threeMinuesAgo);
                });
            }
            this.performanceData[connectionGuid][0].push({ x: moment(timestamp).toDate(), y: values['0'] / 100.0 });
            this.performanceData[connectionGuid][1].push({ x: moment(timestamp).toDate(), y: values['1'] });
            this.performanceData[connectionGuid][2].push({ x: moment(timestamp).toDate(), y: values['2'] / 0.100 });
        };
        PerformanceTask.prototype.removePerformanceChart = function (connection) {
            var connectionGuid = connection.guid();
            var chartTargetId = 'chart-target-' + connectionGuid;
            if (this.charts[chartTargetId]) {
                this.charts[chartTargetId].detach();
                delete this.charts[chartTargetId];
            }
            $('#chart-container-' + connectionGuid).remove();
            delete this.performanceData[connectionGuid];
        };
        PerformanceTask.prototype.updatePerformanceChart = function (connection) {
            console.log('updatePerformanceChart', connection.name(), connection.guid());
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
                this.charts[chartTargetId] = this.createChart(connection, chartTargetId, { series: series });
            }
            else {
                this.charts[chartTargetId].data = { series: series };
                this.charts[chartTargetId].update();
            }
        };
        PerformanceTask.prototype.createChart = function (connection, chartTargetId, data) {
            var chartContainer = $('.chart-container', '.performance-task-template').clone();
            chartContainer.attr('id', 'chart-container-' + connection.guid());
            $('.name', chartContainer).text(connection.name());
            $('.uri', chartContainer).text(connection.uri());
            var chartTarget = $('.chart-target', chartContainer);
            chartTarget.attr('id', chartTargetId);
            $('.dashboard-container').append(chartContainer);
            var chart = new Chartist.Line('#' + chartTargetId, data, {
                showArea: true,
                showPoint: false,
                axisX: {
                    type: Chartist.FixedScaleAxis,
                    divisor: 6,
                    labelInterpolationFnc: function (value) {
                        return moment(value).format('HH:mm:ss');
                    }
                },
                axisY: {
                    type: Chartist.FixedScaleAxis,
                    high: 1,
                    low: 0,
                    ticks: [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1],
                    labelInterpolationFnc: function (value) {
                        return Math.round(value * 100) + ' %';
                    },
                },
            });
            return chart;
        };
        return PerformanceTask;
    })();
    Scoop.PerformanceTask = PerformanceTask;
})(Scoop || (Scoop = {}));
