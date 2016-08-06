'use strict';

define([], function() {
    return ['importTaskController', ['$scope', '$sce', 'TaskSearch', 'Step', 'TaskScenario', 'importTaskService', '$state', '$element', '$timeout', function($scope, sce, TaskSearch, stepService, ImportService, importTaskService, $state, $element, $timeout) {

        $scope.sce = sce;

        $scope.flag = {initialScreen:true};

        $scope.importTask = {};
        $scope.viewOnly = true;
        $scope.$watch('importTask.sourceFriendlyId', function(sourceFriendlyId) {
            $scope.importTask.taskSearchText = sourceFriendlyId;
        });

        $scope.getViewerHeight = function(){
            var height = $(window).height() - $element.find('.import-header').outerHeight() - $element.find('.import-footer').outerHeight();
            if($element.find('.step-header').length){
                height -= $element.find('.step-header').outerHeight();
            }
             else {
                height -= $element.find('.scenario-header').outerHeight();
            }
            return height;
        };

        $scope.getScenarioByFriendlyID = function (sourceFriendlyID) {
            ImportService.scenarioByFriendlyIdWithoutActions.get({friendlyId: sourceFriendlyID}, function (scenario) {
                $scope.scenario = scenario;
                $scope.$emit('hideLoader');
            });
        };

        $scope.getStepJson = function(sourceFriendlyID, stepIndex) {
            stepService.getStep.get({friendlyId: sourceFriendlyID,stepIndex: (stepIndex -1)}, function (stepJson) {
                $scope.stepJson = stepJson;
                $scope.$emit('hideLoader');
            });
        };

        $scope.searchTask=function(taskSearchText){
            if($scope.importTask.isCopyScenario) {
                TaskSearch.checkIfFriendlyIdExists(taskSearchText, null, 'import.task.scenario', $scope.importTask.friendlyId);
            } else {
                TaskSearch.checkIfFriendlyIdExists(taskSearchText, null, 'import.task.step', $scope.importTask.friendlyId, $scope.importTask.importStep);
            }
        };

        $scope.onStepClick = function(stepIndex){
            if($scope.importTask.isCopyScenario) {
                $state.go('import.task.scenario.detail',{stepIndex:stepIndex});
            }
            else {
                $state.go('import.task.step.detail',{stepIndex:stepIndex});
            }
        };

        $scope.onStepClickInViewer = function(stepIndex){
            if(stepIndex !== $scope.stepIndex) {
                if($scope.importTask.isCopyScenario) {
                    $state.go('import.task.scenario.detail', {stepIndex: stepIndex});
                } else {
                    $state.go('import.task.step.detail', {stepIndex: stepIndex});
                }
            }
        };

        $scope.popupClose = function(friendlyId){
            $state.go('content.task.scenario',{friendlyId:friendlyId, taskId:$scope.scenario.taskId._id});
        };

        $scope.copyScenario = function() {
            importTaskService.copyScenario.update({friendlyId: $scope.importTask.friendlyId, sourceFriendlyId: $scope.importTask.sourceFriendlyId,
                includeAttachments: $scope.importTask.includeAttachments || false}, function () {
            //timeout to prevent modal close issue:  BR-755
                $timeout(function () {
                    $state.go('content.task.scenario', {friendlyId: $scope.importTask.friendlyId, taskId:$scope.scenario.taskId._id});
                }, 300);
            });
        };

        $scope.importStep = function(friendlyId, sourceFriendlyId, stepId) {
            importTaskService.importStep.update({friendlyId: friendlyId, sourceFriendlyId: sourceFriendlyId, stepId: stepId}, function (data) {
                //timeout to prevent modal close issue:  BR-755
                $timeout(function () {
                    $state.go('content.task.scenario.step.view', {friendlyId: $scope.importTask.friendlyId, stepIndex: data.stepLength});
                }, 300);
            });
        };

        $scope.goBack = function(friendlyId, sourceFriendlyId){
            if($scope.importTask.isCopyScenario){
                $state.go('import.task.scenario',{friendlyId:friendlyId,sourceFriendlyId:sourceFriendlyId});
            } else {
                $state.go('import.task.step',{friendlyId:friendlyId,sourceFriendlyId:sourceFriendlyId});
            }

        };
        $scope.importTask.copyScenarioConfirmJson = {
            type: 'warning',
            title: 'Confirm Copy Scenario!',
            body : {
                message : 'Copying content from this scenario will result in loss of all changes made to the target scenario. Are you sure you want to continue?'
            },
            actionButtons : [{
                name : 'Cancel'
            },
            {
                name : 'Copy Scenario',
                callback : $scope.copyScenario
            }]
        };
        /*$scope.$on('copyScenario', function() {
            $scope.copyScenario($scope.importTask.friendlyId, $scope.importTask.sourceFriendlyId);
        });*/
    }]];
});
