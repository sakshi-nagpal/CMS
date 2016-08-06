'use strict';

define([
    './controllers/import.client.controller',
    'appModule'
],function(importController){
    ApplicationConfiguration.registerModule('import');

    var module = angular.module('import');
    module.controller(importController[0], importController[1]);
});
