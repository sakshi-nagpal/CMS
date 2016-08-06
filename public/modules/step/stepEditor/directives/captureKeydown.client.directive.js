'use strict';

define ([
], function() {

    return ['captureKeydown', ['$parse', function ($parse) {
        return {
            restrict: 'A',
            compile: function (element, attrs) {
                var fn = $parse(attrs.captureKeydown);
                return function (scope, element) {
                    element[0].addEventListener('keydown', function (event) {
                        scope.$apply(function () {
                            fn(scope, {
                                $event: event
                            });
                        });
                    }, true);
                };
            }
        };
    }]];
});
