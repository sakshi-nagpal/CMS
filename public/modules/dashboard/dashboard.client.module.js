'use strict';


define([
        './controllers/dashboard.client.controller',
        'productService',
        'catalogService',
        'appModule'
    ],

    function (dashboardController, productService, catalogService) {

        ApplicationConfiguration.registerModule('dashboard');

        var module = angular.module('dashboard');

        module
            .factory(catalogService[0], catalogService[1])
            .factory(productService[0], productService[1])
            .controller(dashboardController[0], dashboardController[1]);

});
