'use strict';

define(['historyModule', 'angularMocks'], function() {
    describe('historyVersionController',function(){
        var scope,
            $httpBackend,
            state,
            stateParams,
            timeout,
            element,
            historyVersionController,
            entityId = '55f2a25883514edc454b2a76',
            sampleRevisions = [
                {
                    "_id":"560f9facef7897c80cdb0aa6",
                    "__t":"Revision",
                    "revision":{
                        "_id":"55f2a25883514edc454b2a76",
                        "steps":[
                            {
                                "text":"In Word, display a Blank document.",
                                "_id":"55f2a25832fbf9030b0acec0",
                                "methods":[
                                    {
                                        "type":"Other",
                                        "_id":"55f2a25832fbf9030b0acec5",
                                        "actions":[
                                            {
                                                "text":"Click Blank document.dfgggsg",
                                                "_id":"55f2a25832fbf9030b0acec6"
                                            }
                                        ],
                                        "supported":false,
                                        "primary":true
                                    }
                                ]
                            }
                        ]
                    }
                }
            ];


        // Load the main application module
        beforeEach(module(ApplicationConfiguration.applicationModuleName, function ($translateProvider) {
            $translateProvider.translations('en', {});
        }));
        beforeEach(function() {
            jasmine.addMatchers({
                toEqualData: function(util, customEqualityTesters) {
                    return {
                        compare: function(actual, expected) {
                            return {
                                pass: angular.equals(actual, expected)
                            };
                        }
                    };
                }
            });
        });

        beforeEach(inject(function($controller, _$httpBackend_, _$rootScope_, $state, $stateParams, $timeout){

            state = $state;
            stateParams = $stateParams;
            stateParams.stepIndex = 1;
            timeout = $timeout;
            stateParams.historyId = '560f793f7811e8a006f12c23';
            stateParams.id = entityId;
            scope = _$rootScope_.$new();
            spyOn(scope, '$emit');
            spyOn($state, 'go');
            scope.import = {};
            scope.historyConfig = {};
            $httpBackend = _$httpBackend_;
            //'/history/entity/:entityId/revisions'
            $httpBackend.expect('GET','/history/entity/'+entityId+'/revisions?historyIds=' + stateParams.historyId).respond(sampleRevisions);
            historyVersionController = $controller('historyVersionController',{$scope:scope, $state:state, $element:$('<div></div>'), $timeout: timeout});
            $httpBackend.flush();
        }));

        it('controller function run should set scope variables',function(){

            expect(scope.versionView).toEqualData(true);
            expect(scope.historyId).toEqualData(stateParams.historyId);
            expect(scope.viewMatchedSection).toEqualData({'all' : true});
            expect(scope.$emit).toHaveBeenCalledWith('hideLoader');
        });

        it('comparison view close', function() {
            scope.onComparisonViewClose();
            expect(state.go).toHaveBeenCalledWith('content.task.scenario.history');
            expect(scope.$emit).toHaveBeenCalledWith('hideLoader');
        });

        afterEach(function() {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });
    });

});
