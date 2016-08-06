'use strict';

angular.module('routes').config(['$stateProvider',
    function ($stateProvider) {
        $stateProvider
            .state('skillPopup', {
                abstract:true,
                url: '/skill',
                views: {
                    'popup': {
                        lazyTemplateUrl: 'skill.client.view.html',
                        lazyFiles: 'skillLibraryModule',
                        lazyModule: 'skillLibrary'
                    }
                },
                params:{
                    fullScreen:true
                }
            })
            .state('skill', {
                abstract:true,
                url: '/skill',
                lazyTemplateUrl: 'skill.client.view.html',
                lazyFiles: 'skillLibraryModule',
                lazyModule: 'skillLibrary'
            });
    }]);
