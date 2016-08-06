'use strict';

define([], function() {
    return ['libraryStepController', ['$scope','Step','$stateParams','libraryService','$element','$state','$timeout',
        '$filter','Constants',
        function($scope, stepService, $stateParams, libraryService, $element, $state, $timeout, $filter, Constants) {
            var stepName;
            $scope.isLibrary = true;
            $scope.stepJson = {};
            var stepId = $stateParams.id;
            $scope.errorMessage = '';
            $scope.timerDelay = 5000;
            var callbackPending = false;
            var isCloseRequested = false;
            var methodTypesPromise;
            var stepEditorInitialise;

            if($stateParams.config) {
                $scope.stateConfig = $stateParams.config;
            }

            $scope.$on('$stateChangeSuccess', function() {
                if($scope.stepJson){
                    $scope.$emit('hideLoader');
                }
            });

        var hideCustomLoader = function(){
            if(stepEditorInitialise && methodTypesPromise){
                $scope.$emit('hideLoader');
            }
        };

        var getLibraryStep = function() {
            libraryService.libraryStepById.get({libraryStepId: stepId}, function (stepJson) {
                $scope.stepJson = stepJson;
                $scope.$emit('hideLoader');
                $scope.stepJson.name = stepJson.name;
                $scope.stepJson.creatorName = stepJson.createdBy.displayName;
                $scope.historyConfig = {
                    headerTitle: 'history.library.label_history_header_title',
                    comparisonHeaderTitle: 'history.library.label_history_comparison_header_title',
                    title: 'history.library.label_history_title',
                    versionHeaderTitle:'history.library.label_history_version',
                    value: stepJson.name,
                    stateToGo: 'libraryStep.view',
                    stateToGoParams: {
                        app: $stateParams.app,
                        stepId: stepId,
                        stateConfig: $scope.stateConfig
                    },
                    template: 'library.step.comparison.client.view.html',
                    publishable: false,
                    type: Constants.STEP.LIBRARY,
                    errMsg : 'history.library.label_history_not_available'
                };

                $scope.getMappedTasks();
            });
        };

        getLibraryStep();

        $scope.getMappedTasks = function() {
            var mappedData = {};
            libraryService.mappedStepDetails.query({libraryStepId: stepId}, function(stepDetails, err) {
                stepDetails.map(function(e){
                    mappedData[e.friendlyId] = (mappedData[e.friendlyId] ? (mappedData[e.friendlyId]+ ', Step '): '')  + e.stepNum;
                });
                $scope.mappedStep = {};
                $scope.mappedStep.length = stepDetails.length;
                $scope.mappedStep.detail = mappedData;
            });
        };

        $scope.getMethodTypes = function(){
            $scope.methodTypes = [];
            methodTypesPromise = false;
            stepEditorInitialise = false;
            stepService.getScenarioMethodTypes.query(function(methodTypes){
                methodTypes.forEach(function(element){
                    $scope.methodTypes.push(element.name);
                });
                methodTypesPromise = true;
                hideCustomLoader();
            });
        };

        $scope.getViewerHeight = function(){
            var height = $(window).height() - $element.find('.library-step-header').outerHeight();
            return height;
        };

        $scope.saveData = function(isAutoSave){
            $scope.errorMessage ='';
            if(!$scope.stepJson.name) {
                $scope.errorMessage = $filter('translate')('library.addStepModal.label_addStep_error_blank_message');
            }
            else {
                var tempStepJSON = angular.copy($scope.stepJson);
                tempStepJSON.autoSave = isAutoSave;
                callbackPending = true;
                libraryService.updateLibraryStepById.update({libraryStepId : stepId},tempStepJSON, function(data) {
                    callbackPending = false;
                    if(isCloseRequested) {
                        $scope.editorClose();
                        isCloseRequested = false;
                    }
                    if(!isAutoSave){
                        getLibraryStep();
                    }
                }, function(err) {
                    $scope.errorMessage = $filter('translate')('library.addStepModal.label_addStep_error_message');
                });
            }
        };

        $scope.editorClose = function(isCancel) {
            if((!$scope.errorMessage && !callbackPending) || isCancel) {
                $state.go('libraryStep.view');
            } else if(callbackPending){
                isCloseRequested = true;
            }
        };

        $scope.tagSkill =  function(){
            $state.go('skillPopup.tagLibraryStep.grid',{app: $stateParams.app,stepId:stepId,config:$scope.stateConfig});
        };

        $scope.onStepEditorInitialise = function(){
            stepEditorInitialise = true;
            hideCustomLoader();
        };

        $scope.onStepClose = function(){
            if($scope.stateConfig) {

                $state.go($scope.stateConfig.stateToGo,
                    {
                        app: $scope.stateConfig.stateToGoParams.app, skill: $scope.stateConfig.stateToGoParams.skill
                    });
            }
            else {
                $state.go('skill.browse.1',{app :$stateParams.app});
            }
            $('body').removeClass('modal-open');

        };


        $scope.deleteStep = function (step) {
            $scope.$emit('showLoader');
            libraryService.libraryStepById.delete({libraryStepId: stepId}, function () {
                if($scope.stateConfig && $scope.stateConfig.stateToGoParams.stepCount > 1) {
                    $state.go($scope.stateConfig.stateToGo,
                        {
                            app: $scope.stateConfig.stateToGoParams.app,
                            skill: $scope.stateConfig.stateToGoParams.skill
                        });
                }
                else {
                    $state.go('skill.browse.1',{app :$stateParams.app});
                }
            });
            $('body').removeClass('modal-open');
        };



    }]];
});


