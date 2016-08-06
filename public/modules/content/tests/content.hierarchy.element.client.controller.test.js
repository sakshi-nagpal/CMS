'use strict';

define(['contentModule', 'angularMocks'], function () {
    describe('HierarchyElementController', function () {
        /*
         This controller must check
         . get hierarchy backend call (PENDING)
         . get ancestors backend call
         . hierarchy leaf node click handler
         */
        var scope,
            HierarchyElementController,
            $httpBackend,
            $state,
            $stateParams;

        var sampleHierarchy = {
            'title': 'Chapter 01: Introduction to Microsoft Office 2013 Features',
            'type': 'cms_chapter',
            'app': 'Office 2013',
            'children': []
        };
        var sampleAncestors = [{
            'title': 'GO! with Microsoft Office 2013', 'type': 'cms_series', 'data': {
                'taxonomy': [], 'scenarioTypes': [
                    {'code': 'T1', 'index': 1},
                    {'code': 'A1', 'index': 2},
                    {'code': 'A2', 'index': 3}
                ]
            }
        }, {'title': 'Word 2013', 'type': 'cms_section'}];
        var sampleTaskId = '12345678', sampleTaskFriendlyId = 'G0.1.2.3.4';
        var sampleScenarioId = '123';
        var sampleTaskPhasesArray = [{
            '_id': sampleTaskId,
            'data': [{'id': sampleScenarioId, 'type': 'T1', 'phase': 'Aut'}]
        }];
        var sampleTaskPhasesJson = {};
        sampleTaskPhasesJson[sampleTaskId + 'T1'] = {phase: 'Aut', id: sampleScenarioId};

        // The $resource service augments the response object with methods for updating and deleting the resource.
        // If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
        // the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
        // When the toEqualData matcher compares two objects, it takes only object properties into
        // account and ignores methods.
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
            scope.data.getTaxonomyByProperty = function () {
                return [{name: ''}];
            };
            scope.data.setContentType = function (elementType) {
            };
            scope.data.setElementId = function (elementId) {
            };
            // Point global variables to injected services
            $httpBackend = _$httpBackend_;
            $state = _$state_;
            $stateParams = _$stateParams_;
            $stateParams.seriesId = '1234567899';
            $stateParams.elementId = '1234567890';

            $httpBackend.expectGET('series/' + $stateParams.seriesId + '/element/' + $stateParams.elementId + '/hierarchy').respond(sampleHierarchy);
            $httpBackend.expectGET('element/' + $stateParams.elementId + '/ancestors').respond(sampleAncestors);
            $httpBackend.expectGET('series/' + $stateParams.seriesId + '/element/' + $stateParams.elementId + '/task/phases').respond(sampleTaskPhasesArray);

            HierarchyElementController = $controller('contentHierarchyElementController', {
                $scope: scope,
                $state: $state,
                $element: $('<div></div>')
            });
            $httpBackend.flush();
        }));

        //PENDING TEST
        it('Hierarchy.get must return a JSON containing hierarchy tree', function () {
            // Test scope value
            expect(scope.hierarchy).toEqualData(sampleHierarchy);
        });

        it('Ancestors.get must return an array of ancestors', function () {
            // Test scope value
            expect(scope.ancestors).toEqualData(sampleAncestors);
        });

        it('phases by scenario must return an array', function () {
            // Test scope value
            expect(scope.phases).toEqualData(sampleTaskPhasesJson);
        });

        it('Leaf Node click must change state if scenarioType exists', function () {
            // test state transition
            scope.onChildElementClick(sampleTaskId, sampleTaskFriendlyId);
            expect($state.go).toHaveBeenCalledWith('content.task.scenario', {
                taskId: sampleTaskId,
                friendlyId: sampleTaskFriendlyId + '.' + sampleAncestors[0].data.scenarioTypes[0].code
            });
        });

        //it('Leaf Node click should not change state if scenarioType does not exist', inject(function($controller) {
        //    scope.phases = '';
        //
        //    $httpBackend.expectGET('series/'+$stateParams.seriesId+'/element/'+$stateParams.elementId+'/hierarchy').respond(sampleHierarchy);
        //    $httpBackend.expectGET('element/'+$stateParams.elementId+'/ancestors').respond(sampleAncestors);
        //    $httpBackend.expectGET('series/'+$stateParams.seriesId+'/element/'+$stateParams.elementId+'/task/phases').respond([]);
        //
        //    var ctrl = $controller('contentHierarchyElementController', {$scope: scope, $state: $state, $element: $('<div></div>')});
        //
        //    $httpBackend.flush();
        //
        //    scope.onChildElementClick(sampleTaskId);
        //    expect($state.go).not.toHaveBeenCalled();
        //}));

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });

    });
});
