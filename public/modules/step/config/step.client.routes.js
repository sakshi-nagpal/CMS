'use strict';

angular.module('routes').config(['$stateProvider',
    function ($stateProvider) {
        $stateProvider
            .state('content.task.scenario.step', {
                abstract: true,
                url: '/step/:stepIndex',
                lazyModule: 'step',
                lazyTemplateUrl: 'step.client.view.html',
                lazyFiles: 'stepModule',
                params: {fullScreen : true, config:null}

            })
            .state('content.task.scenario.step.view', {
                url: '/view',
                lazyModule: 'stepViewer',
                lazyTemplateUrl: 'stepViewer.client.view.html',
                lazyFiles: 'stepViewerModule'
            })
            .state('content.task.scenario.step.edit',{
                url: '/edit',
                lazyModule: 'stepEditor',
                lazyTemplateUrl: 'stepEditor.client.view.html',
                lazyFiles: 'stepEditorModule',
                allowedCapabilities: 'edit_content'
            })
            .state('taskStep',{
                abstract: true,
                url: '/task/:friendlyId/steps/:stepIndex',
                views: {
                    'popup': {
                        lazyTemplateUrl: 'step.client.view.html',
                        lazyFiles: 'stepModule',
                        lazyModule: 'step'
                    }
                },
                params: {fullScreen : true, config:null}
            })
            .state('taskStep.view', {
                url: '/view',
                lazyModule: 'stepViewer',
                lazyTemplateUrl: 'stepViewer.client.view.html',
                lazyFiles: 'stepViewerModule'
            })
            .state('taskStep.edit',{
                url: '/edit',
                lazyModule: 'stepEditor',
                lazyTemplateUrl: 'stepEditor.client.view.html',
                lazyFiles: 'stepEditorModule'
            });
    }]);
