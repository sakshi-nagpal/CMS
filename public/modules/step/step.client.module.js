'use strict';

define([
    './controllers/step.client.controller',
    'stepHeader',
    'importTaskService',
    'stepService',
    'scenarioService',
    'commentPopupService',
    'commentsModule',
    'appModule'
],function(stepController,stepHeaderDirective,importTaskService,
           stepService,scenarioService,commentPopupService){
    ApplicationConfiguration.registerModule('step',['comments']);

    var module = angular.module('step');
    module
        .controller(stepController[0],stepController[1])
        .directive(stepHeaderDirective[0],stepHeaderDirective[1])
        .factory(importTaskService[0],importTaskService[1])
        .factory(stepService[0],stepService[1])
        .factory(scenarioService[0],scenarioService[1])
        .factory(commentPopupService[0], commentPopupService[1]);
});
