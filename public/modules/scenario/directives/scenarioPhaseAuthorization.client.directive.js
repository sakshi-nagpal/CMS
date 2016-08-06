
'use strict';

define([], function() {
    return ['phaseEditable',['ScenarioPhaseAuthorization', function(ScenarioPhaseAuthorization) {
        return {
            restrict: 'A',
            link: function($scope, $element, $attr, ctrl) {
                var scenarioPhase;
                $attr.$observe('phaseEditable', function (value) {
                    scenarioPhase = $scope.$eval(value);
                    if(!ScenarioPhaseAuthorization.isScenarioPhaseEditable(scenarioPhase)){
                        $element.remove();
                        $scope.$destroy();
                    }
                });
            }
        };
    }]];
});
