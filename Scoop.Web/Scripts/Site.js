var _currentConnections = {};
var _activeConnections = {};

$(function () {
    // _ConnectionModal
    var connectModalForm = $('#connectModalForm');
    if (connectModalForm) {
        connectModalForm.on('submit', function () {
            var form = $(this);
            $.ajax(
                {
                    url: form.prop('action'),
                    method: form.prop('method'),
                    data: form.serialize()
                })
                .done(function (data) {
                    updateCurrentConnections(data);
                });

            return false;
        });
    }
});

function updateCurrentConnections(updatedConnections) {
    console.log('updateCurrentConnections', updatedConnections);

    for (var i = 0; i < _activeConnections.length; i++) {
        var activeConnection = _activeConnections[i];
        if (!updatedConnections[activeConnection.Guid])
            disconnect(activeConnection);
    }

    _currentConnections = updatedConnections;

    var connectModalTabMyServers = $('#connectModalTabMyServers');
    if (connectModalTabMyServers) {
        var serverList = $('ul', connectModalTabMyServers);
        var template = $('li.connect-template', serverList);

        $('.li', serverList).not(template).remove();

        $.each(_currentConnections, function (key, connection) {
            if (!_activeConnections[connection.Guid]) {
                var serverItem = template.clone();
                serverItem.removeClass('template connect-template');
                serverItem.addClass('connection-' + connection.Guid);

                $('.connect-name', serverItem).text(connection.Name);
                $('.connect-uri', serverItem).text(connection.Uri);
                $('.connect-button', serverItem).on('click', function () {
                    connect(connection);
                });
                $('.disconnect-button', serverItem).on('click', function () {
                    disconnect(connection);
                });

                console.log(connection);

                serverList.append(serverItem);

                if (connection.AutoConnect) {
                    connect(connection).done(function () {
                        serverItem.addClass('connected');
                    });
                }
            }
        });
    }

    console.log(_currentConnections);
}

function connect(connection) {
    console.log('connect', connection);

    disconnect(connection);

    var hubConnection = $.hubConnection(connection.Uri);
    var performanceHub = hubConnection.createHubProxy('performanceHub');

    console.log(hubConnection, performanceHub);

    performanceHub.on('updatePerformance', function (taskName, values, timestamp) {
        updatePerformanceData(connection, taskName, values, timestamp);
        updatePerformanceChart(connection);
    });

    performanceHub.on('updatePerformanceHistory', function (taskResultHistory) {
        for (var i = 0; i < taskResultHistory.length; i++) {
            var taskResult = taskResultHistory[i];
            updatePerformanceData(connection, taskResult.Name, taskResult.Values, taskResult.Timestamp);
        }
        updatePerformanceChart(connection);
    });

    //hubConnection.logging = true;

    var startPromise = hubConnection.start();

    startPromise.done(function () {
        performanceHub.invoke('GetPerformanceHistory');
        _activeConnections[connection.Guid] = hubConnection;

        var serverItems = findServerItem(connection);
        serverItems.each(function () {
            $(this).addClass('connected');
        });
    });

    return startPromise;
}

function disconnect(connection) {
    console.log('disconnect', connection);

    var activeConnection = _activeConnections[connection.Guid];

    if (activeConnection) {
        activeConnection.stop();

        var serverItems = findServerItem(connection);
        serverItems.each(function () {
            $(this).removeClass('connected');
        });

        removePerformanceChart(connection);

        delete _activeConnections[connection.Guid];
    }
}

function findServerItem(connection) {
    var serverItems = $();
    var connectModalTabMyServers = $('#connectModalTabMyServers');
    if (connectModalTabMyServers) {
        serverItems = $('ul > li', connectModalTabMyServers).filter(function () {
            return $(this).hasClass('connection-' + connection.Guid);
        });
    }

    return serverItems;
}

// Performance
var _performanceData = [];

function updatePerformanceData(connection, taskName, values, timestamp) {
    if (!_performanceData[connection.Guid]) {
        _performanceData[connection.Guid] = [[], [], []];
    }

    _performanceData[connection.Guid][0].push({ timestamp: moment(timestamp).toDate(), value: values['0'] / 100.0 });
    _performanceData[connection.Guid][1].push({ timestamp: moment(timestamp).toDate(), value: values['1'] });
    _performanceData[connection.Guid][2].push({ timestamp: moment(timestamp).toDate(), value: values['2'] / 0.100 });
}

function getPerformanceData(connection) {
    if (!_performanceData[connection.Guid]) {
        _performanceData[connection.Guid] = [[], [], []];
    }

    var threeMinuesAgo = moment().add(-3, 'minutes');
    for (var i = 0; i < _performanceData[connection.Guid].length; i++) {
        for (var j = 0; j < _performanceData[connection.Guid][i].length; j++) {
            if (moment(_performanceData[connection.Guid][i][j].timestamp).isBefore(threeMinuesAgo)) {
                _performanceData[connection.Guid][i].shift();
                j = 0;
            } else {
                break;
            }
        }
    }

    return _performanceData[connection.Guid];
}

function removePerformanceChart(connection) {
    $('.performance-' + connection.Guid).remove();
    $('.performance-legend-' + connection.Guid).remove();
    $('.performance-container-' + connection.Guid).remove();
}

function updatePerformanceChart(connection) {
    var legend = ['Tot. CPU', 'Tot. Memory', 'Avg. Disk sec/Transfer [100ms = 100%]'];
    var target = '.performance-' + connection.Guid;
    var legendTarget = '.performance-legend-' + connection.Guid;

    if (!$(target).length) {
        console.log('updatePerformanceChart creating from template', connection);
        var templateContainer = $('.template-mg-container');

        var performanceContainer = templateContainer.clone();
        performanceContainer.removeClass('template template-mg-container').addClass('performance-container-' + connection.Guid);

        var performanceTarget = $('.template-mg', performanceContainer);
        performanceTarget.removeClass('template template-mg').addClass('performance-' + connection.Guid);

        var performanceLegendTarget = $('.template-mg-legend', performanceContainer);
        performanceLegendTarget.removeClass('template template-mg-legend').addClass('performance-legend-' + connection.Guid);

        templateContainer.parent().append(performanceContainer);
    }

    MG.data_graphic({
        //title: 'Performance',
        data: getPerformanceData(connection),
        target: target,
        x_accessor: 'timestamp',
        y_accessor: 'value',
        height: 300,
        full_width: true,
        interpolation: 'linear',
        format: 'percentage',
        animate_on_load: true,
        transition_on_update: false,
        max_y: 1,
        xax_count: 3,
        xax_format: function (date) {
            return date ? moment(date).format('LT') : null;
        },
        legend: legend,
        legend_target: legendTarget,
        mouseover: function (d, i) {
            $('tspan', target + ' svg .mg-active-datapoint').first().text(moment(d.key).format('LT'));
        },
        aggregate_rollover: true,
        show_secondary_x_label: false
    });
}


// Chart.js
//var template = $('.line-chart-template');
//if (!template)
//    return;

//var lineChartCanvas = template.clone();
//lineChartCanvas.removeClass('template line-chart-template');

//var lineChartContext = lineChartCanvas.get(0).getContext('2d');

//var data = {
//    labels: ['CPU', 'Memory', 'Disk', 'Network'],
//    datasets: [
//        {
//            label: "My First dataset",
//            fillColor: "rgba(220,220,220,0.2)",
//            strokeColor: "rgba(220,220,220,1)",
//            pointColor: "rgba(220,220,220,1)",
//            pointStrokeColor: "#fff",
//            pointHighlightFill: "#fff",
//            pointHighlightStroke: "rgba(220,220,220,1)",
//            data: [65, 59, 80, 81, 56, 55, 40]
//        },
//        {
//            label: "My Second dataset",
//            fillColor: "rgba(151,187,205,0.2)",
//            strokeColor: "rgba(151,187,205,1)",
//            pointColor: "rgba(151,187,205,1)",
//            pointStrokeColor: "#fff",
//            pointHighlightFill: "#fff",
//            pointHighlightStroke: "rgba(151,187,205,1)",
//            data: [28, 48, 40, 19, 86, 27, 90]
//        }
//    ]
//};

//var lineChart = new Chart(lineChartContext).Line(data);