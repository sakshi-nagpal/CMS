'use strict';
define([], function() {
    return ['stateChooser', function() {

        return {
            restrict: 'E',
            replace: true,
            scope: {
                stateData :'=',
                currentStateIndex : '=',
                onStateChange : '&'
            },
            templateUrl: 'stateChooser.client.directive.html',
            controller: function($scope){
                 $scope.onStateClick = function($index){
                    $scope.currentStateIndex =  $index;
                    $scope.onStateChange({data:  $scope.currentStateIndex });
                };
            }


        };
    }];
});


// config for stateChooser

/*$scope.stateData =[
    {
        stateText : 'CHOOSE SKILL'
    },
    {
        stateText : 'CHOOSE SOURCE STEP'
    },
    {
        stateText : 'REVIEW METHOD AND CONFIRM'
    }
];

$scope.currentStateIndex = 0;*/

/*<div>
<state-chooser on-state-change="stateChange(data)" state-data="states" current-state-index="currentStateIndex"></state-chooser>
</div>*/


