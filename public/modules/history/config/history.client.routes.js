'use strict';

angular.module('routes').config(['$stateProvider',
    function ($stateProvider) {
        $stateProvider
            .state('content.task.scenario.history', {
                url: '/history/:id',
                lazyModule: 'history',
                lazyTemplateUrl: 'history.client.view.html',
                lazyFiles: 'historyModule',
                controller: 'historyController',
                allowedCapabilities: 'view_history',
                params:{
                    fullScreen:true
                }
            })
            .state('content.task.scenario.history.diff', {
                url: '/1/{leftId}/2/{rightId}',
                templateUrl: 'comparison.client.view.html',
                controller: 'comparisonController',
                params:{
                    fullScreen:true
                }
            })
            .state('content.task.scenario.history.version', {
                url: '/version/:historyId',
                templateUrl: 'comparison.client.view.html',
                controller: 'historyVersionController',
                params:{
                    fullScreen:true
                }
            })
            .state('libraryStep.view.history', {
                url: '/history',
                lazyModule: 'history',
                lazyTemplateUrl: 'history.client.view.html',
                lazyFiles: 'historyModule',
                controller: 'historyController',
                allowedCapabilities: 'view_history',
                params:{
                    fullScreen:true
                }
            })
            .state('libraryStep.view.history.diff', {
                url: '/1/{leftId}/2/{rightId}',
                templateUrl: 'comparison.client.view.html',
                controller: 'comparisonController',
                params:{
                    fullScreen:true
                }
            })
            .state('libraryStep.view.history.version', {
                url: '/version/:historyId',
                templateUrl: 'comparison.client.view.html',
                controller: 'historyVersionController',
                params:{
                    fullScreen:true
                }
            })
    }]);
