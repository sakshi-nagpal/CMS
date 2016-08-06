'use strict';

define([], function () {
    return ['scenarioDocumentView', function () {
        return {
            restrict: 'AE',
            replace: 'false',
            controller: 'viewBoxScenarioController',
            templateUrl: 'viewBox.scenario.document.directive.html'
        };
    }];
});
