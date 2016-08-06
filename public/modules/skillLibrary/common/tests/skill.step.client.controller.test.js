'use strict';


define(['skillImportModule', 'angularMocks'], function(app) {
    describe('SkillStepController', function() {

        //Initialize global variables
        var scope,
            SkillStepController,
            state,
            stateParams,
            rootScope,
            $httpBackend,
            $templateCache,
            template,
            $compile,
            $controller,
            $timeout;


        var sampleLibraryStepId ='55ed13555df88d4008c3e87';
        var sampleFriendlyId= 'GO13.WD13.03.3A.05.T1';
        var sampleStepId ='5593c7edcbc2c8841dd449c1';
        var sampleTaskStep = {
        step:
            {
                '_id'  :'55eae0f9765f7d6808143ceb',
                'skills' :
                    [
                        {'_id' :'55a78b0310758f1414b0174e',
                        'label' :'Publish a Blog',
                        'skillId':'WD_APPLICATION_004',
                        'app':
                            [
                                'Word 2013'
                            ]
                        }
                    ],
                'methods':[]
            },
            'scenario':
            {
                '_id':'5593c7b0cbc2c8841dd3c69a',
            'friendlyId':'GO13.OF13.01.1B.07.A2',
            'taskId':'5593c6a6671702c4064ed5dc',
            'steps':null,
            'updatedTimestamp':'2015-09-05T12:32:57.578Z',
            'createdTimestamp':'2015-07-01T10:57:52.603Z'
            }
        };

        var sampleLibraryStep = {
            '_id':'55eabd469a672688084da6bf',
            'name':'vd',
            'createdBy':'550139f71d6d4664181832e0',
            'product':'Word',
            'text':'vd',
            'mappedSteps':[],
            'skills':
                [
                    {
                        '_id':'55a78b0310758f1414b0174e',
                        'label':'Publish a Blog',
                        'skillId':'WD_APPLICATION_004',
                        'app':['Word 2013']
                    }
                ],
            'methods':
                []
        };


        var sampleSkill =  // for skills GET call
        {
            app: 'Word 2013',
            parentLabels: [],
            product: 'Word',
            skillId: 'WD_Application_2',
            title: 'Write a Blog Entry',
            type: 'skill'
        };

        var init=function(stateData,type){ //to initialize controller in more than one way
            scope.commonData.selectedSkill=stateData;
            scope.commonData.type = type;
            SkillStepController = $controller('SkillStepController', {
                $scope: scope,
                $state: state,
                $element:template
            });
        };

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

        beforeEach(inject(function(_$controller_, _$rootScope_,_$state_,_$stateParams_,_$httpBackend_,_$templateCache_,
                                   _$compile_,_$timeout_) {
            scope = _$rootScope_.$new();
            spyOn(scope, '$emit');
            $controller=_$controller_;
            state = _$state_;
            stateParams=_$stateParams_;
            stateParams.skill=sampleSkill.skillId;
            stateParams.taskId=sampleFriendlyId;
            stateParams.stepId=sampleStepId;
            $timeout=_$timeout_;

            $templateCache = _$templateCache_;
            $compile = _$compile_;

           template = $($compile($templateCache.get('skill.step.client.view.html'))(scope));
            scope.stateData=
                [
                    {
                        stateText:'CHOOSE SKILL',
                        data:{}
                    },
                    {
                        stateText:'CHOOSE SOURCE STEP',
                        data:{},
                        stateParams:{}
                    },
                    {
                        stateText:'REVIEW METHOD AND CONFIRM',
                        data:{}
                    }
                ];
            scope.commonData={};
            scope.stateData=
                [
                    {
                        stateText:'CHOOSE SKILL',
                        data:{}
                    },
                    {
                        stateText:'CHOOSE SOURCE STEP',
                        data:{},
                        stateParams:{}
                    },
                    {
                        stateText:'REVIEW METHOD AND CONFIRM',
                        data:{}
                    }
                ];
            $httpBackend = _$httpBackend_;
            spyOn(state, 'go');
            scope.$digest();
        }));


        it('should set default values when selected skill is available and send one request of taskStep',function(){
            stateParams.type = 'TASK';
            $httpBackend.expect('GET','scenarios/'+sampleFriendlyId+'/steps/id/'+sampleStepId).respond(sampleTaskStep);
            init(sampleSkill,stateParams.type);
            $httpBackend.flush();
            $timeout.flush();
            expect(scope.commonData.selectedSkill.product).toBeDefined();
            expect(scope.scenario).toEqualData(sampleTaskStep.scenario);
            expect(scope.step).toEqualData(sampleTaskStep.step);
        });

        it('should set default values and send two requests when selected skill is not available',function(){
            stateParams.type = 'TASK';
            $httpBackend.expect('GET','/skills/'+stateParams.skill).respond(sampleSkill);
            $httpBackend.expect('GET','scenarios/'+sampleFriendlyId+'/steps/id/'+sampleStepId).respond(sampleTaskStep);
            init(null,stateParams.type);
            $httpBackend.flush();
            expect(scope.commonData.selectedSkill).toEqualData(sampleSkill);
            expect(scope.scenario).toEqualData(sampleTaskStep.scenario);
            expect(scope.step).toEqualData(sampleTaskStep.step);
        });

        it('should set default values when selected skill is available and send one request of libraryStep',function(){
            stateParams.type = 'LIBRARY';
            $httpBackend.expect('GET','library/step/'+sampleStepId).respond(sampleLibraryStep);
            init(sampleSkill,stateParams.type);
            $httpBackend.flush();
            $timeout.flush();
            expect(scope.step).toEqualData(sampleLibraryStep);
        });

        it('should hide loading icon on stateChangeSuccess if step is defined', function () {
            stateParams.type = 'TASK';
            $httpBackend.expect('GET','scenarios/'+sampleFriendlyId+'/steps/id/'+sampleStepId).respond(sampleTaskStep);
            init(sampleSkill,stateParams.type);
            $httpBackend.flush();
            scope.$broadcast('$stateChangeSuccess',{});
            expect(scope.$emit).toHaveBeenCalledWith('hideLoader');
        });
        it('should not hide loading icon on stateChangeSuccess if step is not defined', function () {
            stateParams.type = 'TASK';
            $httpBackend.expect('GET','scenarios/'+sampleFriendlyId+'/steps/id/'+sampleStepId).respond(sampleTaskStep);
            init(sampleSkill,stateParams.type);
            $httpBackend.flush();
            var count = scope.$emit.calls.count();
            scope.step=null;
            scope.$apply();
            scope.$broadcast('$stateChangeSuccess',{});
            expect(scope.$emit.calls.count()).toEqual(count); // to check hideloader is not dispatched
        });

        afterEach(function() {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });
    });
});
