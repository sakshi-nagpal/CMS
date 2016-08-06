'use strict';

define(['contentModule', 'angularMocks'], function () {
    describe('ContentController', function () {
        /*
         This controller must check
         . setHeaderInfo function
         . setHeaderTabs function
         */
        var scope,
            ContentController,
            ConfirmPopupService,
            $httpBackend,
            state;
        var sampleTitle = 'GO! with Microsoft Office 2013', sampleApp = 'Office 2013', sampleScreen = 'task';
        var sampleTabs = [
            {name: 'content.label_tab_content', stateRef: 'content.task.0'},
            {name: 'content.label_tab_issues', stateRef: 'content.task.1'},
            {name: 'content.label_tab_history', stateRef: 'content.task.2'},
            {name: 'content.label_tab_activity', stateRef: 'content.task.3'}
        ];
        var breadcrumbs = [
            {name: 'Home', state: 'dashboard'},
            {name: 'Go with Microsoft Office 13', state: 'content.hierarchy1'}
        ];
        var obj = {
            '_id': '551506f29aa04888102a42dc',
            'title': 'Exploring Microsoft Office 2013',
            'type': 'cms_series',
            'children': [
                {
                    '_id': '551506f29aa04888102a42dd',
                    'title': 'Office Fundamentals',
                    'type': 'cms_section'
                }
            ]
        };

        var chapter = {
            '_id': '551506f29aa04878102a42dc',
            'title': 'Exploring Microsoft Office 2013',
            'type': 'cms_chapter',
            'children': [
                {
                    '_id': '551506f29aa04868102a42dd',
                    'title': 'Office Fundamentals',
                    'type': 'cms_task'
                }
            ]
        };

        var taxonomies = [
            {
                name: 'Go',
                type: 'cms_project'
            }
        ];
        // Load the main application module
        beforeEach(module(ApplicationConfiguration.applicationModuleName, function ($translateProvider) {
            $translateProvider.translations('en', {});
        }));
        beforeEach(inject(function ($controller, _$rootScope_, _$state_) {
            scope = _$rootScope_.$new();
            state = _$state_;
            // Point global variables to injected services
            ContentController = $controller('contentController', {
                $scope: scope,
                $state: state
            });

            spyOn(state, 'go');
        }));

        beforeEach(inject(function (_ConfirmPopupService_, _$httpBackend_) {
            ConfirmPopupService = _ConfirmPopupService_;
            $httpBackend = _$httpBackend_;
            spyOn(ConfirmPopupService, "showConfirm").and.callFake(function (title, message, callback) {
                callback(true);
            });
        }));

        it('Header Info should be set', function () {
            // test state transition with params
            scope.data.setHeaderInfo({title1: sampleTitle, appIcon: sampleApp});
            expect(scope.data.header.title1 === sampleTitle && scope.data.header.appIcon === sampleApp).toBeTruthy();
        });
        it('Tabs should be set', function () {
            // test state transition with params
            scope.data.setHeaderTabs(sampleScreen);
            expect(scope.data.tabs).toEqual(sampleTabs);
        });
        it('Get taxonomy by property', function () {
            var taxonomy = scope.data.getTaxonomyByProperty(taxonomies, 'type', 'cms_project');
            expect(taxonomy[0].name).toEqual('Go');
        });

        it('Change phase of all the Scenarios in a Chapter', function () {
            var phase = {
                "name": "Authoring",
                "code": "AUT"
            };
            $httpBackend.expectPOST('chapter/' + chapter._id + '/update/phase/' + phase.code).respond('OK');
            scope.data.setContentType('cms_chapter');
            scope.data.setElementId('551506f29aa04878102a42dc');
            expect(scope.setPhaseChanger()).toEqual(true);
            scope.changePhase(phase);
            expect(scope.phaseChange.showModal).toEqual(false);
            $httpBackend.flush();
            expect(state.go).toHaveBeenCalled();
        });

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });
    });
});
