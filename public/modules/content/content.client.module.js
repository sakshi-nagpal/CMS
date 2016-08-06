'use strict';
/*
 content module comprises of 3 components
 - Content Hierarchy Series View
 - Content Hierarchy Selected Element View
 - Content Task Viewer
 */
define([
        './controllers/content.client.controller',
        './controllers/content.hierarchy.series.client.controller',
        './controllers/content.hierarchy.element.client.controller',
        './controllers/content.task.client.controller',
        './services/hierarchy.client.service',
        './services/content.client.service',
        './directives/cmsTabs.client.directive',
        './directives/scenarioReference/scenarioReference.client.directive',
        './services/scenarioReference.client.service',
        '/modules/common/services/confirm.popup.service',
        'catalogService',
        'documentModule',
        'appModule'],

    function (contentController, seriesController, elementController, taskController, hierarchyService, contentService, cmsTabsDirective, scenarioReferenceDirective, scenarioReferenceService, catalogService, confimPopupService) {

        ApplicationConfiguration.registerModule('content');

        var module = angular.module('content');
        module.controller(contentController[0], contentController[1])
            .controller(seriesController[0], seriesController[1])
            .controller(elementController[0], elementController[1])
            .controller(taskController[0], taskController[1]);

        module.factory(hierarchyService[0], hierarchyService[1])
            .factory(contentService[0], contentService[1])
            .factory(catalogService[0], catalogService[1])
            .factory(scenarioReferenceService[0], scenarioReferenceService[1])
            .factory(confimPopupService[0], confimPopupService[1]);

        module.directive(cmsTabsDirective[0], cmsTabsDirective[1])
            .directive(scenarioReferenceDirective[0], scenarioReferenceDirective[1]);

        module.constant('contentConstants', {
            appAssets: {
                'Office 2013': 'Office.png',
                'Word 2013': 'Word.png',
                'Access 2013': 'Access.png',
                'Excel 2013': 'Excel.png',
                'PPT 2013': 'PPT.png'
            },
            tabsData: { // configure data for every screen
                'series': [
                    {name: 'content.label_tab_content', stateRef: 'content.hierarchy1.0'},
                    {name: 'content.label_tab_issues', stateRef: 'content.hierarchy1.1'}
                ],
                'element': [
                    {name: 'content.label_tab_content', stateRef: 'content.hierarchy2.0'},
                    {name: 'content.label_tab_issues', stateRef: 'content.hierarchy2.1'}
                ],
                'task': [
                    {name: 'content.label_tab_content', stateRef: 'content.task.0'},
                    {name: 'content.label_tab_issues', stateRef: 'content.task.1'},
                    {name: 'content.label_tab_history', stateRef: 'content.task.2'},
                    {name: 'content.label_tab_activity', stateRef: 'content.task.3'}
                ]
            },
            phaseControl: ['cms_chapter']
        });
    });

