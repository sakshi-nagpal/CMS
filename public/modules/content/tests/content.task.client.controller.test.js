'use strict';

define(['contentModule', 'angularMocks'], function () {
    describe('TaskController', function () {

        var scope,
            HierarchyElementController,
            $httpBackend,
            $state,
            $stateParams;

        var sampleAncestors = [{
            'title': 'GO! with Microsoft Office 2013', 'type': 'cms_series', 'data': {
                'taxonomy': [
                    {
                        'name': 'Series',
                        'view': '0',
                        'index': '1',
                        'type': 'cms_series'
                    },
                    {
                        'name': 'Volume',
                        'view': '1',
                        'index': '2',
                        'type': 'cms_section'
                    },
                    {
                        'name': 'Chapter',
                        'view': '1',
                        'index': '3',
                        'type': 'cms_chapter'
                    },
                    {
                        'name': 'Project',
                        'view': '2',
                        'index': '4',
                        'type': 'cms_project'
                    },
                    {
                        'name': 'Activity',
                        'view': '2',
                        'index': '5',
                        'type': 'cms_task'
                    }
                ],
                'scenarioTypes': [
                    {'code': 'T1', 'index': 1},
                    {'code': 'A1', 'index': 2},
                    {'code': 'A2', 'index': 3}
                ]
            }
        }, {'title': 'Word 2013', 'type': 'cms_section'},
            {'title': 'Word 2013', 'type': 'cms_chapter'},
            {'title': 'Word 2013', 'type': 'cms_project'}];


        var sampleTask = {
            'title': 'XL Activity 2.29: Ungrouping Worksheets',
            'type': 'cms_task',
            'app': 'Excel 2013',
            'data': {
                'scenarios': [
                    {
                        friendlyId: 'GO13.OF13.01.1B.01.T1',
                        type: {
                            index: 1,
                            code: 'T1'
                        }
                    }, {
                        friendlyId: 'GO13.OF13.01.1B.01.A1',
                        type: {
                            index: 2,
                            code: 'A1'
                        }
                    }
                ]
            }
        };

        beforeEach(function () {
            jasmine.addMatchers({
                toEqualData: function (util, customEqualityTesters) {
                    return {
                        compare: function (actual, expected) {
                            return {
                                pass: angular.equals(actual, expected)
                            };
                        }
                    };
                }
            });
        });


        // Load the main application module
        beforeEach(module(ApplicationConfiguration.applicationModuleName, function ($translateProvider) {
            $translateProvider.translations('en', {});
        }));

        // turn on spy function on state.go
        beforeEach(inject(function ($state) {
            spyOn($state, 'go');

        }));

        beforeEach(inject(function ($controller, _$rootScope_, _$httpBackend_, _$state_, _$stateParams_) {
            scope = _$rootScope_.$new();

            //setting data
            scope.data = {};
            scope.data.breadcrumbs = [];
            scope.data.setHeaderTabs = function () {
            }; //fake function tested in parent
            scope.data.setHeaderInfo = function () {
            }; //fake function tested in parent
            scope.data.getTaxonomyByProperty = function (taxonomies, entities, type) {
                return $.grep(taxonomies, function (e) {
                    return e[entities] === type;
                });
            };
            scope.data.setContentType = function (elementType) {
            };
            scope.data.setElementId = function (elementId) {
            };
            // Point global variables to injected services
            $httpBackend = _$httpBackend_;
            $state = _$state_;
            $stateParams = _$stateParams_;
            $stateParams.taskId = '1234567890';

            $httpBackend.expectGET('element/' + $stateParams.taskId + '/ancestors').respond(sampleAncestors);
            $httpBackend.expectGET('task/' + $stateParams.taskId).respond(sampleTask);

            HierarchyElementController = $controller('contentTaskController', {
                $scope: scope,
                $state: $state
            });

            scope.paintTaskViewerHeader($stateParams.taskId);
            $httpBackend.flush();

        }));

        //PENDING TEST
        it('Ancestors.get must return an array of ancestors', function () {
            // Test scope value
            expect(scope.ancestors).toEqualData(sampleAncestors);
        });

        it('Return an object of task by id', function () {
            // Test scope value
            expect(scope.task).toEqualData(sampleTask);
        });

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });

    });
});
