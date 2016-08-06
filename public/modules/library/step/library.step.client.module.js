'use strict';

define([
    './controllers/library.step.client.controller',
    'stepService',
    'libraryService',
    'appModule'
],function(libraryStepController, stepService, libraryService){

   var module = ApplicationConfiguration.registerModule('libraryStep');
    module
        .controller(libraryStepController[0], libraryStepController[1])
        .service(stepService[0], stepService[1])
        .service(libraryService[0], libraryService[1]);

});
