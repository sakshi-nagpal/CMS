'use strict';

define([], function () {
    return ['stepController', ['$scope', 'Step', '$stateParams', '$element', '$state', '$timeout',
        'TaskScenario', 'CommentPopupService', function ($scope, stepService, $stateParams, $element, $state, $timeout, TaskScenario, CommentPopupService) {
            var methodTypesPromise;
            var stepEditorInitialise;
            var isEditableVal;
            $scope.stepIndex = $stateParams.stepIndex;
            $scope.friendlyId = $stateParams.friendlyId;
            $scope.methodTypes = [];
            $scope.scenarioSiblings = [{friendlyId: $stateParams.friendlyId}];
            $scope.stepNewCommnetCount = [];

            if ($stateParams.config) {
                $scope.stepConfig = $stateParams.config;
            }

            var getStep = function () {
                stepService.getStep.get({
                    friendlyId: $stateParams.friendlyId,
                    stepIndex: ($scope.stepIndex - 1)
                }, function (stepJson) {
                    $scope.stepJson = stepJson;
                    $scope.$broadcast('stepJsonRefreshed');
                    $scope.$emit('hideLoader');
                });
            };

            var hideCustomLoader = function () {
                if (stepEditorInitialise && methodTypesPromise) {
                    $scope.$emit('hideLoader');
                }
            };

            var getStepViewerNewComment = function () {
                if ($scope.stepNewCommentCountArray == undefined) {
                    var scenarioId = $scope.scenario._id;
                    stepService.getScenarioNewCommentCount.get({
                        scenarioId: scenarioId
                    }, function (response) {
                        $scope.stepNewCommentCountArray = {countArray: response.steps};
                    }, function (errorResponse) {
                        $scope.error = errorResponse.data.message;

                    });
                }
            };

            if (!($scope.stepConfig && !$scope.stepConfig.isPopupMode)) {
                TaskScenario.scenarioByFriendlyIdWithoutActions.get({friendlyId: $stateParams.friendlyId}, function (scenario) {
                    $scope.scenario = scenario;
                    getStep();
                    $timeout(function () {
                        getStepViewerNewComment($scope.stepIndex - 1);
                    });
                });
            } else {
                getStep();
                $timeout(function () {
                    getStepViewerNewComment($scope.stepIndex - 1);
                });
            }

            $scope.onStepClose = function () {
                if ($scope.stepConfig) {
                    $state.go($scope.stepConfig.stateToGo,
                        {
                            app: $scope.stepConfig.stateToGoParams.app, skill: $scope.stepConfig.stateToGoParams.skill,
                            friendlyId: $scope.friendlyId
                        });
                }
                else {
                    $state.go('dashboard');
                }
            };

            $scope.onStepClickInViewer = function (index) {
                if (index !== $scope.stepIndex) {
                    $state.go($state.current.name, {stepIndex: index});
                }
            };

            $scope.onStepClickInEditor = function (index) {
                if (index !== $scope.stepIndex)
                    $state.go('content.task.scenario.step.edit', {stepIndex: index});
            };

            $scope.timerDelay = 5000;

            $scope.saveData = function (isAutoSave) {
                var tempStepJSON = angular.copy($scope.stepJson);
                tempStepJSON.friendlyId = $scope.friendlyId;
                tempStepJSON.autoSave = isAutoSave;

                stepService.scenarioStep.update(tempStepJSON, function () {
                    $scope.scenario.steps[$scope.stepIndex - 1].text = tempStepJSON.text;
                    if (!isAutoSave) {
                        getStep();
                    }
                });
            };

            $scope.showComment = function (index, stepId) {
                var scenarioId = $scope.scenario._id;
                CommentPopupService.showStepPopup('Comments: Step', index, scenarioId, stepId, $scope.stepNewCommentCountArray, function () {
                    getStep();
                });
            };


            $scope.deleteStep = function (step) {
                $scope.$emit('showLoader');
                stepService.scenarioStep.delete({
                    friendlyId: $scope.friendlyId,
                    stepId: $scope.stepJson._id
                }, function () {
                    //timeout to prevent modal close issue
                    $state.go('content.task.scenario');

                });
            };
            $scope.editorClose = function (step) {
                // Step Editor gets closed and launches Step Viewer
                $state.go('content.task.scenario.step.view');
            };

            $scope.getMethodTypes = function () {
                $scope.methodTypes = [];
                methodTypesPromise = false;
                stepEditorInitialise = false;
                stepService.getScenarioMethodTypes.query(function (methodTypes) {
                    methodTypes.forEach(function (element) {
                        $scope.methodTypes.push(element.name);
                    });
                    methodTypesPromise = true;
                    hideCustomLoader();
                });
            };

            $scope.onStepEditorInitialise = function () {
                stepEditorInitialise = true;
                hideCustomLoader();
            };

            $scope.getViewerHeight = function () {
                var height = $(window).height() - $element.find('.step-header').outerHeight();
                return height;
            };

            /*
             Scenario Switcher
             */
            $scope.onSwitchScenario = function () {
                $state.go($state.current.name, {
                    stepIndex: 1,
                    friendlyId: $element.find('.scenario-switcher option:selected').val()
                });
            };

            $scope.$on('$viewContentLoaded', function (event) {
                isEditableVal = $state.current.name === 'content.task.scenario.step.edit' ? true : false;
                stepService.scenarioSiblings.query({
                    friendlyId: $stateParams.friendlyId,
                    hasSteps: true,
                    isEditable: isEditableVal
                }, function (scenarioSiblings) {
                    $scope.scenarioSiblings = scenarioSiblings;
                });
            });

            $scope.onMethodStatusChange = function (id, status) {
                stepService.methodStatus.update({
                    friendlyId: $scope.friendlyId,
                    methodId: id,
                    methodStatus: status
                }, function () {
                });
            }

        }]];
});
