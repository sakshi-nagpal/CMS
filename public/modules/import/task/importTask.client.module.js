'use strict';

define([
    './controllers/import.task.client.controller',
    'scenarioService',
    'stepService',
    'importTaskService',
    'appModule'
],function(importTaskController, scenarioService, stepService, importTaskService){
    ApplicationConfiguration.registerModule('importTask',['step', 'stepViewer', 'scenario']);

    var module = angular.module('importTask');
    module
        .controller(importTaskController[0], importTaskController[1])
        .factory(scenarioService[0], scenarioService[1])
        .factory(stepService[0], stepService[1])
        .factory(importTaskService[0], importTaskService[1]);
});
