/**
* Created by Ayushi on 8/20/2015.
*/

'use strict';

define([], function() {
    return ['historyController', ['$scope','historyService','$element','$stateParams','$state', 'Constants',
        function($scope,historyService,$element,$stateParams,$state, Constants) {
        $scope.history={};
        $scope.compareButtonState = false;
        $scope.versionFilterData = {};
        $scope.versionFilterData.versionFilterType = 'all';
        var checkedInputs = {};
        var selectedInputIndexMap = [];

        // Get entity history
        historyService.getEntityHistory.query({id: $stateParams.id}, function (data) {
            $scope.history = data;
            if($scope.historyConfig.type != Constants.STEP.LIBRARY){
                $scope.versionFilterData.versionFilterType = 'all';
                $scope.phases = window.phases;
            }
            $scope.$emit('hideLoader');
        });

        // Get history container height
        $scope.getContainerHeight = function(){
            var height = $(window).height() - $element.find('.history-header').outerHeight();
            $element.find('.history-container').outerHeight(height);
        };

        $(window).on('resize',$scope.getContainerHeight);

        $scope.onHistoryClose = function(){
            $state.go($scope.historyConfig.stateToGo);
        };

        // count checked input boxes
        $scope.countChecked = function($event){
            var checkedCount = $element.find('input[name=version_checkbox]:checked').length;
            if(checkedCount <2){
                $scope.compareButtonState = false;
                $element.find('input[name=version_checkbox]').attr("disabled", false);
            } else if(checkedCount>2){
                $($event.target).attr('checked', false);
            } else{
                $scope.compareButtonState = true;
                $element.find('input[name=version_checkbox]:not(:checked)').attr("disabled", true);
            }
        };

        //Launch scenario version
        $scope.onVersionClick = function(version) {
            if($scope.historyConfig.type === Constants.STEP.LIBRARY) {
                $state.go('libraryStep.view.history.version', {historyId: $scope.history[$scope.history.length - version]._id});
            } else {
                $state.go('content.task.scenario.history.version', {historyId: $scope.history[$scope.history.length - version]._id});
            }
        };

        // Launch comparison view
        $scope.onCompareClick= function(){
            selectedInputIndexMap=[];
            var inputs = $element.find('input[name=version_checkbox]');
            var inputsChecked = $element.find('input[name=version_checkbox]:checked');
            for(var i=0; i<inputsChecked.length; i++){
                selectedInputIndexMap.push($(inputsChecked[i]).data().version);// are pushed in decreasing order as in DOM
            }

            if($scope.historyConfig.type === Constants.STEP.LIBRARY){
                $state.go('libraryStep.view.history.diff', {leftId: $scope.history[$scope.history.length - selectedInputIndexMap[1]]._id, rightId: $scope.history[$scope.history.length - selectedInputIndexMap[0]]._id});
            }else{
                $state.go('content.task.scenario.history.diff', {leftId: $scope.history[$scope.history.length - selectedInputIndexMap[1]]._id, rightId: $scope.history[$scope.history.length - selectedInputIndexMap[0]]._id});

            }

        };
        $scope.$watch('versionFilterData.versionFilterType',function(){
            $element.find('input[name=version_checkbox]:checked').attr('checked',false);
            $element.find('input[name=version_checkbox]').attr("disabled", false);
            $scope.compareButtonState = false;
        });

        $scope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
            /* if task history is landed from child state, controller doesn't run, so hide loader */
            if ((toState.name === 'content.task.scenario.history') && fromState.name.indexOf(toState.name)>=0){
                $scope.$emit('hideLoader');
            }
        });
    }]];
});

