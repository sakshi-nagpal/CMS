'use strict';

define([
    'stepEditorDirective',
    'ngCkeditorDirective',
    'captureKeydownDirective',
    'appModule'
],function(stepEditorDirective, ngCkeditorDirective, captureKeydownDirective){

   var module = ApplicationConfiguration.registerModule('libraryStepEditor');

    module
        .directive(stepEditorDirective[0],stepEditorDirective[1])
        .directive(ngCkeditorDirective[0],ngCkeditorDirective[1])
        .directive(captureKeydownDirective[0],captureKeydownDirective[1]);

});
