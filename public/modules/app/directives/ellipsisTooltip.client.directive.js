'use strict';
define([], function() {

    return ['ellipsisTooltip', function() {

        function link (scope, element) {
            scope.$watch('ellipsisTooltip', function(ellipsisTooltip) {
            element[0].removeAttribute('title');
            if(element[0].scrollWidth > element[0].offsetWidth){
                    element[0].setAttribute('title', scope.ellipsisTooltip);
                }
            });
        }

        return {
            restrict: 'A',
            link: link,
            scope: {
                ellipsisTooltip: '='
            }
        };
    }];
});
