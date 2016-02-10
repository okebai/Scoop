interface KnockoutBindingHandlers {
    select2: KnockoutBindingHandler;
    performanceChart: KnockoutBindingHandler;
}

$(() => {
    ko.bindingHandlers.select2 = {
        init: (element: any, valueAccessor: () => any, allBindingsAccessor?: KnockoutAllBindingsAccessor, viewModel?: any, bindingContext?: KnockoutBindingContext) => {
            var options = valueAccessor();

            var el = $(element);

            el.select2(options);

            ko.utils.domNodeDisposal.addDisposeCallback(element, () => {
                el.select2('destroy');
            });
        },
        update: (element: any, valueAccessor: () => any, allBindingsAccessor?: KnockoutAllBindingsAccessor, viewModel?: any, bindingContext?: KnockoutBindingContext) => {
            allBindingsAccessor().selectedOptions();

            $(element).trigger('change');
        }
    };

    ko.bindingHandlers.performanceChart = {
        init: (element: any, valueAccessor: () => any, allBindingsAccessor?: KnockoutAllBindingsAccessor, viewModel?: any, bindingContext?: KnockoutBindingContext) => {
            var data = <Chartist.IChartistData>valueAccessor();

            var el = $(element);

            var chart = new Chartist.Line(el, data,
            {
                showArea: true,
                showPoint: false,
                fullWidth: true,
                axisX:
                {
                    type: Chartist.FixedScaleAxis,
                    divisor: 6,
                    labelInterpolationFnc(value: any) {
                        return moment(value).format('HH:mm:ss');
                    }
                },
                axisY:
                {
                    type: Chartist.FixedScaleAxis,
                    high: 1,
                    low: 0,
                    ticks: [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1],
                    labelInterpolationFnc(value: any) {
                        return Math.round(value * 100) + ' %';
                    },
                },
            });

            ko.utils.domNodeDisposal.addDisposeCallback(element, () => {
                el.detach();
            });
        },
        update: (element: any, valueAccessor: () => any, allBindingsAccessor?: KnockoutAllBindingsAccessor, viewModel?: any, bindingContext?: KnockoutBindingContext) => {
            var data = <Scoop.ITaskResult>valueAccessor();

            var el = $(element);

            $(element).trigger('change');
        }
    };
});