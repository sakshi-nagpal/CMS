'use strict';

angular.module('routes').config(['$stateProvider',
    function ($stateProvider) {
        $stateProvider
            .state('content.task.scenario', {
                url: '/:friendlyId',
                params: {taskId : null},
                lazyModule: 'scenario',
                lazyTemplateUrl: 'scenario.client.view.html',
                lazyFiles: 'scenarioModule'
            });
    }]);
