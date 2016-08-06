'use strict';

angular.module('routes').config(['$stateProvider','Constants',
    function ($stateProvider,Constants) {
        $stateProvider
            .state('skillPopup.tag', {
                url: '/:app/tag/task/:friendlyId/step/:stepNum',
                lazyModule: 'skillTagging',
                lazyFiles: 'skillTaggingModule',
                lazyTemplateUrl: 'skillTagging.client.view.html',
                controller:'SkillTaggingController',
                allowedCapabilities: 'edit_content',
                abstract: true,
                data:{
                    type:Constants.STEP.TASK,
                    stateToGo : 'content.task.scenario'
                }
            })
            .state('skillPopup.tag.grid', {
                url:'',
                views:{
                    'gridView': {
                        controller: 'SkillGridController',
                        templateUrl :'skill.grid.client.view.html'
                    }
                }
            })
            .state('skillPopup.tagLibraryStep',{
                url: '/:app/tag/library/step/:stepId',
                lazyModule: 'skillTagging',
                params:{config:null},
                lazyFiles: 'skillTaggingModule',
                lazyTemplateUrl: 'skillTagging.client.view.html',
                controller:'SkillTaggingController',
                allowedCapabilities: 'edit_content',
                abstract: true,
                data:{
                    type:Constants.STEP.LIBRARY,
                    stateToGo : 'libraryStep.view'
                }
            })
            .state('skillPopup.tagLibraryStep.grid', {
                url:'',
                views:{
                    'gridView': {
                        controller: 'SkillGridController',
                        templateUrl :'skill.grid.client.view.html'
                    }
                }
            });
    }]);
