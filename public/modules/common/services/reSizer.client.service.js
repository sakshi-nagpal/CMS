'use strict';

define ([
], function() {
    return ['reSizer' ,['$rootScope','$timeout',function ($rootScope, $timeout) {
        var totalHeight = $(window).height();
        var timer = 300;

        (function($,sr){
            var debounce = function (func, threshold, execAsap) {
                var timeout, availableHeight;

                return function debounced () {
                    var obj = this, args = arguments;
                    function delayed () {
                        if (!execAsap)
                            func.apply(obj, args);
                        timeout = null;
                    }

                    if (timeout)
                        clearTimeout(timeout);
                    else if (execAsap)
                        func.apply(obj, args);

                    timeout = $timeout(delayed, threshold || timer);
                };
            };
            // smartresize
            jQuery.fn[sr] = function(fn){  return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr); };

        })(jQuery,'smartresize');


        $(window).smartresize(function(){
            totalHeight = $(window).height();
            $rootScope.$apply();
        });

        this.getUpdatedHeight = function(){

            return totalHeight;
        };


    }]];
});
