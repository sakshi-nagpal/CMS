'use strict';

define([
    './controllers/history.client.controller',
    './services/history.client.service',
    './filters/versionFilter.client.filter',
    './comparison/controllers/comparison.client.controller',
    './comparison/controllers/history.version.client.controller',
    './comparison/services/comparison.client.service',
    './comparison/constants/comparison.engine.client.constant',
    './comparison/services/compare.client.service',
    './comparison/services/json.diff.calculator.client.service',
    './comparison/services/html.diff.calculator.client.service',
    './comparison/constants/accented.characters.client.constant',
    'appModule'
],function(historyController, historyService,versionFilter,comparisonController, historyVersionController, historyComparisonService,comparisonConstants,compareService,jsonDiffCalculator,htmlDiffCalculator,accentedCharConstant){
    ApplicationConfiguration.registerModule('history');
    var module = angular.module('history');
    module
        .controller(historyController[0], historyController[1])
        .filter(versionFilter[0],versionFilter[1])
        .factory(historyService[0], historyService[1])
        .controller(comparisonController[0], comparisonController[1])
        .controller(historyVersionController[0], historyVersionController[1])
        .constant(comparisonConstants[0],comparisonConstants[1])
        .factory(historyComparisonService[0], historyComparisonService[1])
        .factory(compareService[0], compareService[1])
        .factory(jsonDiffCalculator[0], jsonDiffCalculator[1])
        .factory(htmlDiffCalculator[0], htmlDiffCalculator[1])
        .constant(accentedCharConstant[0], accentedCharConstant[1]);
});
