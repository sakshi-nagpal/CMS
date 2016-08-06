'use strict';

define ([
], function() {

    return ['stepHeader',['$timeout',function ($timeout) {
        return {
            restrict: 'E',
            scope : {
                scenario: '=',
                stepSwitch:'=?',
                scenarioSwitch:'=?',
                stepIndex: '=?',
                scenarioSiblings: '=?',
                onChangeStep:'&?',
                onSwitchScenario:'&?'
            },
            link: function(scope,$element) {
                scope.$watchGroup(['scenarioSiblings', 'scenario'], function(newValues, oldValues) {
                    if (newValues)                    {
                        $timeout(function(){
                            $element.find('.scenario-switcher').selectpicker('refresh');
                            $element.find('.selectpicker').removeAttr('title');
                        },0);
                    }
                }, true);
            },
            controller:function($scope,$element,$timeout){
                $scope.stepSwitch = $scope.stepSwitch ? $scope.stepSwitch : false;
                $scope.getTooltipText = function(html){
                    return angular.element('<div>'+html+'</div>').text();
                };
                $timeout(function(){
                    $element.find('.scenario-switcher').selectpicker('refresh');
                    $element.find('.selectpicker').removeAttr('title');
                },0);
            },
            templateUrl:'stepHeader.client.view.html'
        };
    }]];

});
