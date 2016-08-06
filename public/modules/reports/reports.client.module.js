'use strict';


define([
        './controllers/reports.client.controller',
        './services/reports.client.service',
        'bootstrapDateRangePicker',
        'daterangepicker',
        'appModule'
    ],

    function (reportsController, reportService) {

        var module = ApplicationConfiguration.registerModule('reports',['daterangepicker']);

        module
            .controller(reportsController[0], reportsController[1])
            .service(reportService[0], reportService[1]);
    });
