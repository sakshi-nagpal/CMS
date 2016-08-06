'use strict';


define(['skillTaggingModule', 'angularMocks'], function(app) {
    describe('SkillTaggingController', function() {

        //Initialize global variables
        var scope,
            TaggingController,
            state,
            stateParams,
            $httpBackend,
            $templateCache,
            template,
            $compile;

        var skill={ // for skills push and pop check
            _id: '55925eeac2b8c7740d393813',
            skillId: 'WD_Application_3',
            label: 'Create and Set Up a Blog Account'
        };

        var sampleSkillList = [ // for skills GET call
            {
                _id: '55925eeac2b8c7740d393811',
                skillId: 'WD_Application_2',
                label: 'Write a Blog Entry'
            },
            skill
        ];

        var sampleScenario = { // for scenario GET call
            '_id' : '55558ca626c2edd81cfef0e9',
            'friendlyId' : 'GO13.AC13.03.3A.02.A2',
            'taskId' : {
                _id:'5549e405e20c0104052ad199',
                app:'Word 2013'
            },
            'steps' : [
                {
                    '_id' : '55558ca626c2edd81cfef0ec',
                    'skills':[sampleSkillList[0]]
                }
            ]
        };

        var sampleProduct = [{
            title: 'Word',
            thumbnail: 'Word.png'
        }];

        var samplePutData= { // for PUT call
            'scenarioId':'55558ca626c2edd81cfef0e9',
            'stepId':'55558ca626c2edd81cfef0ec',
            'skills':[sampleSkillList[0]]
        };

        // Load the main application module

        beforeEach(module(ApplicationConfiguration.applicationModuleName, function ($translateProvider) {
            $translateProvider.translations('en', {});
        }));


        beforeEach(inject(function($controller, _$rootScope_,_$state_,_$stateParams_,_$httpBackend_,TaskScenario,
                                   skillLibraryService,DataTransformer,$filter, _$templateCache_,_$compile_) {
            scope = _$rootScope_.$new();

            state = _$state_;
            stateParams=_$stateParams_;
            stateParams.friendlyId = sampleScenario.friendlyId;
            stateParams.stepNum = 1;
            stateParams.app = 'Word 2013';

            state.current.data = {
                type:'TASK',
                stateToGo:'content.task.scenario'
            };
            $httpBackend = _$httpBackend_;

            $httpBackend.expect('GET','scenarios/'+sampleScenario.friendlyId+'?getTaskData=true&includeActions=false')
                .respond(sampleScenario);
            $httpBackend.whenGET('product').respond (sampleProduct);

            $templateCache = _$templateCache_;
            $compile = _$compile_;
            template = $($compile($templateCache.get('skillTagging.client.view.html'))(scope));
            spyOn(state, 'go');


            TaggingController = $controller('SkillTaggingController', {

                $scope: scope,
                $state: state,
                $element : template
            });

            scope.$digest();
            $httpBackend.flush();
        }));


        it('should check if all scope variables are initialized',function(){
            expect(scope.stepJson).toEqual(sampleScenario.steps[stateParams.stepNum-1]);
            expect(scope.selectedSkills).toEqual(sampleScenario.steps[stateParams.stepNum-1].skills);
            expect(scope.gridConfig).toBeDefined();
        });


        it('should redirect to task.scenario page on popup close',function() {
            scope.popupClose();
            expect(state.go).toHaveBeenCalledWith(state.current.data.stateToGo,{friendlyId:sampleScenario.friendlyId,taskId:sampleScenario.taskId._id});
        });

        it('should update skills and redirect to taskViewer',function() {
            $httpBackend.expect('PUT','scenarios/'+sampleScenario._id+'/step/'+sampleScenario.steps[0]._id+'/skills',samplePutData).respond(200);
            scope.doneTagging();
            $httpBackend.flush();
            expect(state.go).toHaveBeenCalledWith(state.current.data.stateToGo,{friendlyId:sampleScenario.friendlyId,taskId:sampleScenario.taskId._id});
        });

        it('should tag skill if it is not previously tagged',function(){
            scope.onGridClick(skill,true);
            expect(scope.selectedSkills.length).toBe(2);
        });

        it('should remove tagging if it is pre tagged',function(){
            scope.onGridClick(skill,true);
            scope.onGridClick(skill,false);
            expect(scope.selectedSkills.length).toBe(1);
        });

        it('should remove the skill from skillList',function(){
            scope.clearSkill();
            expect(scope.selectedSkills.length).toBe(0);
        });

        it('should update the value of commonData.product',function(){
            scope.launchState(sampleProduct.title);
            expect(scope.commonData.product).toEqual(sampleProduct.title);
        });

        /*it ('should check that type of step is library and update skills in library step after tagging',function(){
             var newSkillTaggingController;
             inject(function($controller) {

                 state.current.data = {
                     type:'LIBRARY',
                     stateToGo:'libraryStep.view'
                 };
                 scope.selectedSkills = [{
                     _id: '55925eeac2b8c7740d393811',
                     skillId: 'WD_Application_2',
                     label: 'Write a Blog Entry'
                 }];
                var sampleLibraryStepID = '55558ca626c2edd81cfef0e9';
                 stateParams.libraryStepId = '5593c7edcbc2c8841dd449c1';
                 var sampleLibraryPutData = {
                     'libraryStepId':'55558ca626c2edd81cfef0e9'
                 };
                 var sampleConfig = {};
                 stateParams.config = sampleConfig;

             newSkillTaggingController = $controller('SkillTaggingController', {
             $scope: scope,
             $element :template
             });

             $httpBackend.expect('GET','library/step/'+stateParams.libraryStepId).respond(sampleScenario);
             $httpBackend.flush();
             *//*$httpBackend.expect('PUT','library/step/'+sampleLibraryStepID+'/skills',sampleLibraryPutData).respond(200);
             scope.doneTagging();
             $httpBackend.flush();
             expect(state.go).toHaveBeenCalledWith(state.current.data.stateToGo,{app:sampleScenario.taskId.app,stepId:stateParams.stepId,config:sampleConfig});
*//*
         });
         });
*/
        afterEach(function() {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });
    });
});
