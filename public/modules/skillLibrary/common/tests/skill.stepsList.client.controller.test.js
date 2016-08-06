'use strict';


define(['skillImportModule', 'angularMocks'], function(app) {
    describe('SkillStepsListController', function() {

        //Initialize global variables
        var scope,
            SkillStepsListController,
            state,
            stateParams,
            rootScope,
            $httpBackend,
            $controller,
            $timeout,
            template,
            templateCache,
            $compile;


        var sampleData=[ // get task step call
            {
                friendlyId: 'GO13.WD13.03.3A.05.T1',
                phase: {
                    code: 'DEV'
                },
                steps:{
                    text: 'Change the citation Style to MLA',
                    _id: '5593c7edcbc2c8841dd449cd'
                },
                updatedTimestamp: '2015-07-16T11:46:26.179Z'
            }
        ];
        var sampleLibraryStepData=[ // get Library step call
            {
                friendlyId: 'GO13.WD13.03.3A.05.T1',
                phase: {
                    code: 'DEV'
                },
                steps:{
                    text: 'Change the citation Style to MLA',
                    _id: '5593c7edcbc2c8841dd449cd'
                },
                updatedTimestamp: '2015-07-16T11:46:26.179Z'
            }
        ];

        var sampleSkill =  // for skills GET call
            {
                app: 'Word 2013',
                parentLabels: [],
                product: 'Word',
                skillId: 'WD_Application_2',
                title: 'Write a Blog Entry',
                type: 'skill'
            };

        var init=function(skill,stateData){ //to initialize controller in more than one way
            stateParams.skill=skill;
            scope.commonData.selectedSkill=stateData;
            SkillStepsListController = $controller('SkillStepsListController', {
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


        beforeEach(inject(function(_$controller_, _$rootScope_,_$state_,_$stateParams_,_$httpBackend_,_$timeout_,
                                   _$templateCache_,_$compile_) {
            scope = _$rootScope_.$new();
            spyOn(scope, '$emit');
            rootScope = _$rootScope_;
            state = _$state_;
            stateParams=_$stateParams_;
            stateParams.skill=sampleSkill.skillId;
            $controller=_$controller_;
            $timeout=_$timeout_;
            templateCache=_$templateCache_;
            $compile=_$compile_;
            scope.view={
                heading:'',
                subHeading:''
            };
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
            template = $($compile(templateCache.get('skill.stepsList.client.view.html'))(scope));
            scope.commonData={};
            $httpBackend = _$httpBackend_;
            spyOn(state, 'go');
            scope.$digest();
        }));

        it('should set default values when selected skill is available and send two request',function(){
            $httpBackend.expect('GET','/skills/'+stateParams.skill+'/steps').respond(sampleData);
            $httpBackend.expect('GET','library/skill/id/'+stateParams.skill+'/steps').respond(sampleLibraryStepData);
            init(sampleSkill.skillId,sampleSkill);
            $httpBackend.flush();
            $timeout.flush();
            expect(scope.taskSteps).toEqualData(sampleData);
            expect(scope.commonData.selectedSkill).toBeDefined();
            expect(scope.commonData.selectedSkill.skillId).toEqual(sampleSkill.skillId);

        });

        it('should set default values when selected skill is available and send three requests',function(){
            $httpBackend.expect('GET','/skills/'+stateParams.skill+'/steps').respond(sampleData);
            $httpBackend.expect('GET','library/skill/id/'+stateParams.skill+'/steps').respond(sampleLibraryStepData);
            $httpBackend.expect('GET','/skills/'+stateParams.skill).respond(sampleSkill);
            init(sampleSkill.skillId,null);
            $httpBackend.flush();
            expect(scope.librarySteps).toEqualData(sampleData);
            expect(scope.commonData.selectedSkill).toBeDefined();
            expect(scope.commonData.selectedSkill.skillId).toEqual(sampleSkill.skillId);
        });

        it('should redirect to previous state when get call returns no result',function(){
            $httpBackend.expect('GET','/skills/'+stateParams.skill+'/steps').respond(404);
            $httpBackend.expect('GET','library/skill/id/'+stateParams.skill+'/steps').respond(404);
            init(sampleSkill.skillId,sampleSkill);
            $httpBackend.flush();
            expect(state.go).toHaveBeenCalledWith('skillPopup.import.1');
        });

        it('should redirect to previous state when skill is not defined',function(){
            init(null,null);
            expect(state.go).toHaveBeenCalledWith('skillPopup.import.1');
        });

        it('should redirect to skillPopup.import.3 on click on taskStep',function(){
            rootScope.onTaskStepListClick = function(){
                state.go('skillPopup.import.3');
            };
            $httpBackend.expect('GET','/skills/'+stateParams.skill+'/steps').respond(sampleData);
            $httpBackend.expect('GET','library/skill/id/'+stateParams.skill+'/steps').respond(sampleLibraryStepData);
            init(sampleSkill.skillId,sampleSkill);
            $httpBackend.flush();
            scope.onTaskStepClick(sampleData[0].friendlyId,sampleData[0].steps._id);
        });

        it('should redirect to skillPopup.import.3 on click on LibraryStep',function(){
            rootScope.onLibraryStepListClick = function(){
                state.go('skillPopup.import.3');
            };
            $httpBackend.expect('GET','/skills/'+stateParams.skill+'/steps').respond(sampleData);
            $httpBackend.expect('GET','library/skill/id/'+stateParams.skill+'/steps').respond(sampleLibraryStepData);
            init(sampleSkill.skillId,sampleSkill);
            $httpBackend.flush();
            scope.onLibraryStepClick(sampleData[0].steps._id);
        });

        it('should hide loading icon on stateChangeSucess if taskSteps are defined', function () {
            $httpBackend.expect('GET','/skills/'+stateParams.skill+'/steps').respond(sampleData);
            $httpBackend.expect('GET','library/skill/id/'+stateParams.skill+'/steps').respond(sampleLibraryStepData);
            init(sampleSkill.skillId,sampleSkill);
            $httpBackend.flush();
            var count = scope.$emit.calls.count();
            rootScope.$broadcast('$stateChangeSuccess',{});
            expect(scope.$emit).toHaveBeenCalledWith('hideLoader');
            expect(scope.$emit.calls.count()).toEqual(count+1); // to check hideloader is dispatched
        });

        it('should not hide loading icon on stateChangeSucess if taskSteps are not defined', function () {
            $httpBackend.expect('GET','/skills/'+stateParams.skill+'/steps').respond(sampleData);
            $httpBackend.expect('GET','library/skill/id/'+stateParams.skill+'/steps').respond(sampleLibraryStepData);
            init(sampleSkill.skillId,sampleSkill);
            $httpBackend.flush();
            var count = scope.$emit.calls.count();
            scope.taskSteps=null;
            scope.librarySteps = null;
            scope.$apply();
            rootScope.$broadcast('$stateChangeSuccess',{});
            expect(scope.$emit.calls.count()).toEqual(count); // to check hideloader is not dispatched
        });

        afterEach(function() {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });
    });
});
