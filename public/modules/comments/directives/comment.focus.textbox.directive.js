'use strict';

define ([
], function() {
    return ['focusMe',['$timeout',function ($timeout) {
            return function(scope, element, attrs) {
                scope.$watch(attrs.focusMe, function(value) {
                    if(value) {
                        $timeout(function() {
                            element.focus();
                        }, 700);
                    }
                });
            };

}]];
});
