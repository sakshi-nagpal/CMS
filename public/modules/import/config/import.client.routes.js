'use strict';

angular.module('routes').config(['$stateProvider',
    function ($stateProvider) {
        $stateProvider
            .state('import', {
                abstract:true,
                url: '/import',
                views: {
                    'popup': {
                        lazyTemplateUrl: 'import.client.view.html',
                        lazyFiles: 'importModule',
                        lazyModule: 'import',
                        controller: 'importController'
                    }
                },
                params:{
                    fullScreen:true
                }
            });
    }]);
