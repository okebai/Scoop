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
var Scoop;
(function (Scoop) {
})(Scoop || (Scoop = {}));
$(function () {
    ko.bindingHandlers.select2 = new function () {
        this.init = function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            var options = valueAccessor();
            var el = $(element);
            el.select2(options);
            ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
                el.select2('destroy');
            });
        }, this.update = function (element, valueAccessor, allBindings, viewModel, bindingContext) {
            allBindings().selectedOptions();
            $(element).trigger('change');
        };
    };
    var connectionService = new Scoop.ConnectionService();
    var connectionViewModel = new Scoop.ConnectionViewModel(connectionService);
    ko.applyBindings(connectionViewModel);
});
//# sourceMappingURL=Site.js.map