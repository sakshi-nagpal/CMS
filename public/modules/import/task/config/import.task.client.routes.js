'use strict';

angular.module('routes').config(['$stateProvider',
    function($stateProvider) {

        $stateProvider
            .state('import.task', {
                abstract: true,
                url: '/task',
                lazyTemplateUrl: 'import.task.client.view.html',
                lazyFiles: 'importTaskModule',
                lazyModule: 'importTask',
                controller: 'importTaskController',
                dependencies: [{
                    module: 'step',
                    files: 'stepModule'
                },{
                    module: 'stepViewer',
                    files: 'stepViewerModule'
                },{
                    module: 'scenario',
                    files: 'scenarioModule'
                }]
            })
            .state('import.task.scenario', {
                url: '/scenario/:friendlyId/from/:sourceFriendlyId',
                templateUrl: 'import.task.scenario.client.view.html',
                controller: function($scope, $stateParams) {
                    $scope.importTask.friendlyId = $stateParams.friendlyId;
                    $scope.importTask.sourceFriendlyId = $stateParams.sourceFriendlyId;
                    $scope.importTask.isCopyScenario = true;
                }
            })
            .state('import.task.scenario.detail', {
                url: '/step/:stepIndex',
                templateUrl: 'import.task.step.client.view.html',
                controller: function($scope, $stateParams) {
                    $scope.stepIndex = $stateParams.stepIndex;
                }
            })
            .state('import.task.step', {
                url: '/:friendlyId/step/:stepNum/from/:sourceFriendlyId',
                templateUrl: 'import.task.scenario.client.view.html',
                controller: function($scope, $stateParams) {
                    $scope.importTask.friendlyId = $stateParams.friendlyId;
                    $scope.importTask.sourceFriendlyId = $stateParams.sourceFriendlyId;
                    $scope.importTask.importStep = $stateParams.stepNum;
                    $scope.importTask.isCopyScenario = false;
                }
            })
            .state('import.task.step.detail', {
                url: '/step/:stepIndex',
                templateUrl: 'import.task.step.client.view.html',
                controller: function($scope, $stateParams) {
                    $scope.stepIndex = $stateParams.stepIndex;
                    $scope.importTask.stepIndex = $stateParams.stepIndex
                }
            });
    }]);

