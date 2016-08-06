'use strict';

angular.module('routes').config(['$stateProvider',
    function ($stateProvider) {
        $stateProvider
            .state('skill.browse',{
                url: '/browse/:app',
                lazyModule: 'skillBrowse',
                lazyFiles: 'skillBrowseModule',
                lazyTemplateUrl:'skillBrowse.client.view.html',
                controller:'SkillBrowseController',
                abstract: true
            })
            .state('skill.browse.1', {
                url: '',
                templateUrl:'skill.grid.client.view.html',
                controller:'SkillGridController'
            })
            .state('skill.browse.2', {
                url:'/skill/:skill',
                templateUrl:'skill.stepsList.client.view.html',
                controller:'SkillStepsListController',
                allowedCapabilities: 'view_skill_steps'
            });
    }]);
