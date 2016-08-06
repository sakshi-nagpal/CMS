'use strict';

define(['contentModule', 'angularMocks'], function () {
    describe('HierarchySeriesController', function () {
        /*
         This controller must check
         . get hierarchy backend call (PENDING w.r.t Data Model)
         . hierarchy leaf node click handler
         */
        var scope,
            HierarchySeriesController,
            $httpBackend,
            $state,
            $stateParams;

        var sampleHierarchy = {
            'title': 'GO! with Microsoft Office 2013',
            'type': 'cms_series',
            'children': [],
            'data': {'taxonomy': []}
        };
        var sampleElementId = '1234567890';
        var sampleChildCountByTypeArray = [{'_id': '551506cff46f5ac8221cd3dc', 'value': 29}];
        var sampleChildCountByTypeJson = {'551506cff46f5ac8221cd3dc': 29};
        var sampleVersion = [{
            title: 'Office Version 1',
            series: [{
                'title': 'Dummy series',
                'thumbnail': 'test.png'
            }]
        },
            {
                title: 'Office Version 2',
                series: [{
                    'title': 'Dummy series',
                    'thumbnail': 'test.png'
                },
                    {
                        'title': 'Dummy series',
                        'thumbnail': 'test.png'
                    }]
            }];

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
            var parentType = 'cms_chapter';
            var childType1 = 'cms_task';
            var childType2 = 'cms_project';
            scope.data.setHeaderTabs = function () {
            }; //fake function tested in parent
            scope.data.setHeaderInfo = function () {
            };//fake function tested in parent
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

            $httpBackend.expectGET('series/' + $stateParams.seriesId + '/hierarchy').respond(sampleHierarchy);
            $httpBackend.expectGET('series/' + $stateParams.seriesId + '/parent/' + parentType + '/child/' + childType1 + '/count').respond(sampleChildCountByTypeArray);
            $httpBackend.expectGET('series/' + $stateParams.seriesId + '/parent/' + parentType + '/child/' + childType2 + '/count').respond(sampleChildCountByTypeArray);

            HierarchySeriesController = $controller('contentHierarchySeriesController', {
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

        it('Return a array of child count by type', function () {
            // Test scope value
            expect(scope.data.projectCount).toEqualData(sampleChildCountByTypeJson);
            expect(scope.data.taskCount).toEqualData(sampleChildCountByTypeJson);
        });

        it('Leaf Node click must change state', function () {
            // test state transition with params
            scope.onChildElementClick(sampleElementId);
            expect($state.go).toHaveBeenCalledWith('content.hierarchy2.0', {
                seriesId: $stateParams.seriesId,
                elementId: sampleElementId
            });

        });

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });

    });
});
