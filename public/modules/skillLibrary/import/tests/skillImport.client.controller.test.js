'use strict';


define(['skillImportModule', 'angularMocks'], function(app) {
    describe('skillImportController', function() {

        //Initialize global variables
        var scope,
            skillImportController,
            state,
            stateParams,
            rootScope,
            $httpBackend,
            $templateCache,
            template,
            $compile,
            notification,
            $timeout;

        var sampleScenario = { // for scenario GET call
            '_id' : '55558ca626c2edd81cfef0e9',
            'friendlyId' : 'GO13.AC13.03.3A.02.A2',
            'taskId' : {
                _id:'5549e405e20c0104052ad199',
                app:'Word 2013',
                product : 'Word'
            },
            'steps' : [
                {
                    '_id' : '55558ca626c2edd81cfef0ec',
                    'skills':[
                        {
                            _id: '55925eeac2b8c7740d393811',
                            skillId: 'WD_Application_2',
                            label: 'Write a Blog Entry'
                        }
                    ],
                    'type':'TASK'
                }
            ]
        };

        var sampleLibraryStepId = '55dd5aee81199c2c104d176f';
        var sourceFriendlyId = 'GO13.AC13.03.3A.02.A1';

        var samplePutData = {
            'friendlyId':sampleScenario.friendlyId,
            'sourceFriendlyId':sourceFriendlyId
        };
        var sampleLibraryPut = {
            'friendlyId':sampleScenario.friendlyId
        };
        var sampleMappedPut = {
            'taskId' : 'GO13.WD13.03.3A.05.T1'
        };
        var sampleData= {
            app: 'Word 2013',
            product:'Word',
            skillId: 'WIN_Application_3',
            title: 'Publish a Blog'
        };
        var sampleTaskCountList = [ // for taskStepCount GET call
            {
                _id: sampleData.skillId,
                count: 4
            }
        ];

        var sampleLibraryCountList = [
            {
                _id: sampleData.skillId,
                count: 3
            }
        ];

        var tasktype = 'TASK';
        var libraryType = 'LIBRARY';



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

        beforeEach(inject(function($controller, _$rootScope_,_$state_,_$stateParams_,_$httpBackend_,_$timeout_,
                                   _$compile_,_$templateCache_,notificationService) {
            scope = _$rootScope_.$new();
            rootScope = _$rootScope_;
            state = _$state_;
            stateParams=_$stateParams_;
            stateParams.friendlyId = sampleScenario.friendlyId;
            stateParams.stepNum = 1;
            stateParams.app = 'Word 2013';
            notification=notificationService;

            $httpBackend = _$httpBackend_;
            $httpBackend.expect('GET','/products/'+sampleScenario.taskId.product+'/skills/taskSteps/count')
                .respond(sampleTaskCountList);
            $httpBackend.expect('GET','/product/'+sampleScenario.taskId.product+'/skills/librarySteps/count')
                .respond(sampleLibraryCountList);
            $timeout=_$timeout_;
            $templateCache = _$templateCache_;
            $compile = _$compile_;
            template = $($compile($templateCache.get('skillImport.client.view.html'))(scope));
            spyOn(state, 'go');
            spyOn(notification,'showNotification').and.callThrough({settings:{message:'dummy'}});

            scope.taskStepCount = [
                {
                    _id: sampleData.skillId,
                    count: 4
                } ,
                {
                    _id: sampleScenario.steps[0].skills[0].skillId,
                    count: 0
                }
            ];

            scope.libraryStepCount = [
                {
                    _id: sampleData.skillId,
                    count: 2
                },
                {
                    _id: sampleScenario.steps[0].skills[0].skillId,
                    count: 0
                }
            ];
            skillImportController = $controller('SkillImportController', {
                $scope: scope,
                $element :template,
                $state: state
            });
            $httpBackend.flush();
            scope.$digest();
        }));

        it('should check if scope variables are defined',function(){
            expect(scope.commonData.friendlyId).toEqual(stateParams.friendlyId);
            expect(scope.commonData.stepNum).toEqual(stateParams.stepNum);
            expect(scope.commonData.app).toEqual(stateParams.app);
        });

        it('should redirect to task.scenario page on popup close',function() {
            scope.popupClose();
            expect(state.go).toHaveBeenCalledWith('content.task.scenario',{friendlyId:sampleScenario.friendlyId});
        });

        it('should redirect to other state',function() {
            scope.changeState(1);
            expect(state.go).toHaveBeenCalledWith(scope.stateData[1].state,scope.stateData[1].stateParams);
        });

        it('should redirect to state 1 in case of no skill is provided',function(){ // state.params.skills are null
            state.current.stateNum = 2;
            rootScope.$broadcast('$stateChangeSuccess',state);
            expect(scope.currentStateIndex).toEqual(state.current.stateNum - 1);
            expect(state.go).toHaveBeenCalledWith('skillPopup.import.1');
        });

        it('should go to else block of $stateChangeSuccess handler',function(){                                                                                           //in case of stateNumber is 1
            state.current.stateNum = 1;
            rootScope.$broadcast('$stateChangeSuccess',state);
            expect(state.go).not.toHaveBeenCalled();
            expect(scope.currentStateIndex).toEqual(state.current.stateNum - 1);
        });

        it('should redirect to content.task.scenario.step.view and send import taskStep call on click on finish-import button',function(){
            scope.finishImport(sampleScenario.friendlyId,sourceFriendlyId,sampleScenario.stepId,tasktype);
            $httpBackend.expect('PUT','scenarios/'+sampleScenario.friendlyId+'/source/'+sourceFriendlyId+'/import/step',samplePutData).respond(200);
            $httpBackend.flush();
            $timeout.flush();
            expect(state.go).toHaveBeenCalledWith('content.task.scenario.step.view',{friendlyId:sampleScenario.friendlyId,stepIndex:stateParams.stepNum});
        });

        it('should redirect to content.task.scenario.step.view and send import libraryStep call on click on finish-import button',function(){
         scope.finishImport(sampleScenario.friendlyId,sourceFriendlyId,sampleScenario.stepId,libraryType);
         $httpBackend.expect('PUT','scenarios/'+sampleScenario.friendlyId+'/import/step', sampleLibraryPut).respond(200);
         $httpBackend.expect('PUT','library/step/mapped/add', sampleMappedPut).respond(200);
         $httpBackend.flush();
         $timeout.flush();
         expect(state.go).toHaveBeenCalledWith('content.task.scenario.step.view',{friendlyId:sampleScenario.friendlyId,stepIndex:stateParams.stepNum});
         });

        it('should redirect to skillPopup.import.3 on click on taskStepList',function(){
            scope.onTaskStepListClick(sampleScenario.steps[0].skills[0].skillId,sampleScenario.friendlyId,sampleScenario.steps[0]._id,tasktype);
            expect(state.go).toHaveBeenCalledWith('skillPopup.import.3',{skill:sampleScenario.steps[0].skills[0].skillId,taskId:sampleScenario.friendlyId,stepId:sampleScenario.steps[0]._id,type:tasktype});
        });

        it('should redirect to skillPopup.import.3 on click on libraryStepList',function(){
            scope.onLibraryStepListClick(sampleScenario.steps[0].skills[0].skillId,sampleScenario.steps[0]._id,libraryType);
            expect(state.go).toHaveBeenCalledWith('skillPopup.import.3',{skill:sampleScenario.steps[0].skills[0].skillId,stepId:sampleScenario.steps[0]._id,type:libraryType});
        });

        it('should redirect to next state if skill has taskSteps', function () {
            scope.onGridClick(sampleData);
            expect(state.go).toHaveBeenCalledWith('skillPopup.import.2',{skill:sampleData.skillId});
        });

        it('should show notification when skill has no taskSteps', function () {
            scope.onGridClick(sampleScenario.steps[0].skills[0].skillId);
            expect(notification.showNotification).toHaveBeenCalled();
        });

        it('should change the application on click on change button',function(){
            scope.launchState(sampleData.product);
            $httpBackend.expect('GET','/products/'+sampleData.product+'/skills/taskSteps/count')
                .respond(sampleTaskCountList);
            $httpBackend.expect('GET','/product/'+sampleData.product+'/skills/librarySteps/count')
                .respond(sampleLibraryCountList);
            $httpBackend.flush();
        });

        it('should check if app call is dispatched when not set from previous state',function(){
            var newSkillImportController;
            inject(function($controller) {
                stateParams.app='';
                newSkillImportController = $controller('SkillImportController', {
                    $scope: scope,
                    $element :$('<div></div>')
                });
                $httpBackend.expect('GET','scenarios/'+sampleScenario.friendlyId+'?getTaskData=true&includeActions=false').respond(sampleScenario);
                $httpBackend.expect('GET','/products/'+sampleScenario.taskId.product+'/skills/taskSteps/count')
                    .respond(sampleTaskCountList);
                $httpBackend.expect('GET','/product/'+sampleScenario.taskId.product+'/skills/librarySteps/count')
                    .respond(sampleLibraryCountList);

                $httpBackend.flush();
                expect(scope.commonData.friendlyId).toEqual(stateParams.friendlyId);
                expect(scope.commonData.stepNum).toEqual(stateParams.stepNum);
                //expect(scope.scenario).toEqualData(sampleScenario);

            });
        });


        afterEach(function() {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });
    });
});
