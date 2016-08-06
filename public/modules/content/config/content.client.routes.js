'use strict';

angular.module('routes').config(['$stateProvider',
    function ($stateProvider) {
        $stateProvider
            .state('content', {
                abstract: true,
                url: '/content',
                dsr: true,
                sticky: true,
                lazyModule: 'content',
                lazyFiles: 'contentModule',
                lazyTemplateUrl: 'content.client.view.html',
                controller: 'contentController'
            })
            .state('content.hierarchy1', {                                                  // Hierarchy View 1
                abstract: true,
                url: '/hierarchy/1/{seriesId}',
                template: '<ui-view/>',
                controller:'contentHierarchySeriesController'
            })
            .state('content.hierarchy1.0', { // Hierarchy View 1 - tab[0] content list
                url: '',
                templateUrl: 'hierarchy.series.list.client.view.html'
            })
            .state('content.hierarchy1.1', {  // Hierarchy View 1 - tab[1] issues
                url: '/1',
                templateUrl: 'hierarchy.series.issues.client.view.html'
            })


            .state('content.hierarchy2', {                                                  // Hierarchy View 2
                abstract: true,
                url: '/hierarchy/2/{seriesId}/{elementId}',
                template: '<ui-view/>',
                controller:'contentHierarchyElementController'
            })
            .state('content.hierarchy2.0', { // Hierarchy View 2 -  tab[0] content list
                url: '',
                templateUrl: 'hierarchy.element.list.client.view.html'
            })
            .state('content.hierarchy2.1', { // Hierarchy View 2 -  tab[1] issues
                url: '/1',
                templateUrl: 'hierarchy.element.issues.client.view.html'
            })

            .state('content.task', {
                abstract : true,                                                              // Task Viewercontent
                url: '/task',
                controller: 'contentTaskController',
                template: '<div class="contentTask" data-ui-view></div>'
            });

    }
]);

