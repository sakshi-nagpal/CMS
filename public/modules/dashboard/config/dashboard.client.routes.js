'use strict';

angular.module('routes').config(['$stateProvider','Constants',
    function($stateProvider, Constants) {
        $stateProvider.state(Constants.MODULES.dashboard, {
            url: '/',
            lazyModule: Constants.MODULES.dashboard,
            lazyFiles: 'dashboardModule',
            lazyTemplateUrl: 'dashboard.client.view.html'
        });
    }
]);
