'use strict';

angular.module('routes').config(['$stateProvider',
    function ($stateProvider) {
        $stateProvider
            .state('reports', {
                url: '/reports',
                lazyModule: 'reportsModule',
                lazyTemplateUrl: 'reports.client.view.html',
                lazyFiles: 'reportsModule',
                controller: 'reportsController',
                allowedCapabilities: 'view_reports'
            });
    }]);
