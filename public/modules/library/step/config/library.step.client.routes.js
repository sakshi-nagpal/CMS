'use strict';

angular.module('routes').config(['$stateProvider',
    function ($stateProvider) {
        $stateProvider
            .state('libraryStep', {
                abstract:true,
                url: '/{app}/library/step/{id}',
                views:{
                    'library':{
                        lazyTemplateUrl: 'library.step.client.view.html',
                        lazyFiles: 'libraryStepModule',
                        lazyModule: 'libraryStep',
                        controller: 'libraryStepController'
                    }
                },
                params:{
                    fullScreen:true,
                    config:null
                }

            })
            .state('libraryStep.view', {
                url: '/view',
                lazyTemplateUrl: 'library.step.viewer.client.view.html',
                lazyFiles: 'libraryStepViewerModule',
                lazyModule: 'libraryStepViewer'
            })
            .state('libraryStep.edit', {
                url: '/edit',
                lazyTemplateUrl: 'library.step.editor.client.view.html',
                lazyFiles: 'libraryStepEditorModule',
                lazyModule: 'libraryStepEditor',
                allowedCapabilities: 'edit_content'
            });
    }]);
