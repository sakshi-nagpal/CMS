'use strict';

define([
    'stepViewerDirective',
    'appModule'
],function(stepViewerDirective){
    ApplicationConfiguration.registerModule('stepViewer');
    var module = angular.module('stepViewer');
    module

        .directive(stepViewerDirective[0],stepViewerDirective[1]);
});
