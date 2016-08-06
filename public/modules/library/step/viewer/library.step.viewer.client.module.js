'use strict';

define([
    'stepViewerDirective',
    'appModule'
],function(stepViewerDirective){

   var module = ApplicationConfiguration.registerModule('libraryStepViewer');


    module
        .directive(stepViewerDirective[0],stepViewerDirective[1]);


});
