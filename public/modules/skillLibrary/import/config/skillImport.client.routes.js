'use strict';

angular.module('routes').config(['$stateProvider',
    function ($stateProvider) {
        $stateProvider
            .state('skillPopup.import',{
                url: '/import/:friendlyId/step/:stepNum/state',
                lazyModule: 'skillImport',
                lazyFiles: 'skillImportModule',
                params: {app: null, taskId:null},
                lazyTemplateUrl: 'skillImport.client.view.html',
                controller:'SkillImportController',
                abstract: true
            })
            .state('skillPopup.import.1', {
                url: '/1',
                views:{
                    'state1' : {
                        templateUrl:'skill.grid.client.view.html',
                        controller:'SkillGridController'
                    }
                },
                stateNum:1,
                allowedCapabilities: 'edit_content'
            }).state('skillPopup.import.2',{
                url: '/2?skill',
                views:{
                    'state2' : {
                        templateUrl:'skill.stepsList.client.view.html',
                        controller:'SkillStepsListController'
                    }
                },
                stateNum:2,
                allowedCapabilities: 'edit_content'
            }).state('skillPopup.import.3',{
                url: '/3?skill&task/:taskId/type/:stepType/steps/id/:stepId',
                views:{
                    'state3' : {
                        templateUrl:'skill.step.client.view.html',
                        controller:'SkillStepController'
                    }
                },
                stateNum:3,
                allowedCapabilities: 'edit_content'
            });

    }]);
