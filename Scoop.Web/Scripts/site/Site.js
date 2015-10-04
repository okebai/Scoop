/// <reference path="../typings/select2/select2.d.ts" />
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
var UUID = (function () {
    var lut = [];
    for (var i = 0; i < 256; i++) {
        lut[i] = (i < 16 ? '0' : '') + (i).toString(16);
    }
    var self = {
        generate: function () {
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
        },
            this.update = function (element, valueAccessor, allBindings, viewModel, bindingContext) {
                allBindings().selectedOptions();
                $(element).trigger('change');
            };
    };
    var connectionService = new Scoop.ConnectionService();
    var connectionViewModel = new Scoop.ConnectionViewModel(connectionService);
    ko.applyBindings(connectionViewModel);
});
