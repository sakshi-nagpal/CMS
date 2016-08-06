'use strict';

define ([], function() {
    return['cmsTabs', function() {
        return {
            restrict: 'AE',
            replace: 'true',
            scope: {
                'obj' : '=' // add attribute obj={{obj}}, meant for passing data
            },
            templateUrl: 'cmsTabs.client.directive.html'
        };
    }];
});
