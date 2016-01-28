/// <reference path="../vendor/typings/knockout/knockout.d.ts" />
/// <reference path="../vendor/typings/select2/select2.d.ts" />

interface KnockoutBindingHandlers {
    select2: KnockoutBindingHandler;
    performanceChart: KnockoutBindingHandler;
}

$(() => {
    ko.bindingHandlers.select2 = new function() {
        this.init = (element, valueAccessor, allBindings, viewModel, bindingContext) => {
                var options = valueAccessor();

                var el = $(element);

                el.select2(options);

                ko.utils.domNodeDisposal.addDisposeCallback(element, () => {
                    el.select2('destroy');
                });
            },
            this.update = (element, valueAccessor, allBindings, viewModel, bindingContext) => {
                allBindings().selectedOptions();

                $(element).trigger('change');
            }
    };

    ko.bindingHandlers.performanceChart = new function() {
        this.init = (element, valueAccessor, allBindings, viewModel, bindingContext) => {
                var data = <Scoop.ITaskResult>valueAccessor();

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

                ko.utils.domNodeDisposal.addDisposeCallback(element, () => {
                    el.detach();
                });
            },
            this.update = (element, valueAccessor, allBindings, viewModel, bindingContext) => {
                var data = <Scoop.ITaskResult>valueAccessor();

                var el = $(element);

                $(element).trigger('change');
            }
    };
});