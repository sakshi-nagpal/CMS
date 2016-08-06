'use strict';


define(['skillBrowseModule', 'angularMocks'], function(app) {
    describe('SkillBrowseController', function() {

        //Initialize global variables
        var scope,
            SkillBrowseController,
            state,
            stateParams,
            rootScope,
            $httpBackend,
            $templateCache,
            template,
            $compile,
            notification,
            $timeout,
            event;

        var sampleScenario = {
            'friendlyId' : 'GO13.WD13.02.2A.02.T1',
            'taskId' : {
                app:'Word 2013',
                product : 'Word'

            },
            'steps' : [
                {
                    'id' : '5593c7c3cbc2c8841dd3d510',
                    'text' : 'Display the document in Read Mode',
                    'skills':[
                        {
                            skillId: 'WD_Application_2',
                            title: 'Write a Blog Entry'
                        }
                    ]
                }
            ]
        };

        var sampleLibraryStep = {
            '_id' : '55dd5aee81199c2c104d176f',
            'name' : 'abc',
            'mappedSteps' : [],
            'skills' : [
                {
                    'title' : 'Publish a Blog',
                    'skillId' : 'WD_APPLICATION_004'
                }
            ],
            'methods' : [
                {
                    'type' : 'Keyboard',
                    'actions' : [
                        {
                            'text' :'access'
                        }
                    ]
                }
            ],
            'app' : [
                'Access 2013'
            ],
            'text' : 'access'
        };
        var sampleCountList = [ // for taskStepCount GET call
            {
                _id: 'WD_Application_2',
                count: 4
            }
        ];

        var sampleStepIndex = {
            index : 2
        };

        var type={
            'task': 'TASK',
            'library': 'LIBRARY'
        };

        var sampleTaskStepConfig = {
            isPopupMode: true,
            stateToGo : 'skill.browse.2',
            isScenarioSwitchable : false,
            stateToGoParams:
                {
                    app : 'Word 2013',
                    skill : 'WD_Application_2'
                },
            isEditable : false
        };

        var sampleLibraryStepConfig = {
            isPopupMode: true,
            stateToGo : 'skill.browse.2',
            isScenarioSwitchable : false,
            stateToGoParams:
            {
                stepCount:0,
                app : 'Word 2013',
                skill : 'WD_Application_2'
            },
            isEditable : false
        };


        var wrongData = {
            skillId: 'dummy'
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

        beforeEach(inject(function($controller, _$rootScope_,_$state_,_$stateParams_,_$httpBackend_,_$timeout_,
                                   _$compile_,_$templateCache_,Step,notificationService) {
            scope = _$rootScope_.$new();
            rootScope = _$rootScope_;
            state = _$state_;
            notification=notificationService;
            stateParams=_$stateParams_;
            stateParams.app = 'Word 2013';
            $httpBackend = _$httpBackend_;
            $httpBackend.expect('GET','/products/'+sampleScenario.taskId.product+'/skills/taskSteps/count')
                .respond(sampleCountList);
            $httpBackend.expect('GET','/product/'+sampleScenario.taskId.product+'/skills/librarySteps/count')
                .respond(sampleCountList);
            $timeout=_$timeout_;
            $templateCache = _$templateCache_;
            $compile = _$compile_;

            scope.authentication.user ={
                roles : ['contentAuthor']
            };

            template = $($compile($templateCache.get('skillBrowse.client.view.html'))(scope));
            spyOn(state, 'go');
            spyOn(notification,'showNotification').and.callThrough({settings:{message:'dummy'}});
            spyOn(notification,'hideNotification').and.callThrough();

                SkillBrowseController = $controller('SkillBrowseController', {
                $scope: scope,
                $element :template,
                $state: state
            });
            $httpBackend.flush();
            $timeout.flush();
            scope.$digest();
        }));


        it('should check if scope variables are defined',function(){
            expect(scope.commonData.app).toEqual(stateParams.app);
            expect(scope.view).toBeDefined();
            expect(scope.gridConfig).toBeDefined();
            expect(scope.stepData).toBeDefined();
        });

       /* it('should redirect to skill.browse.1',function() {
            scope.launchState();
            expect(state.go).toHaveBeenCalled();
        });*////change it

        it('should create breadcrumb on stateChangeSuccess',function(){
            state.current.name = scope.stateData[1].state;
            rootScope.$broadcast('$stateChangeSuccess',state);
            expect(scope.view.breadcrumbs.length).toBe(2);
        });

        it('should redirect to taskStep.view on click on task step',function() {
            $httpBackend.expect('GET','scenarios/'+sampleScenario.friendlyId+'/steps/id/'+sampleScenario.steps[0].id+
            '/index').respond(sampleStepIndex);
            scope.onTaskStepListClick(sampleScenario.steps[0].skills[0].skillId,sampleScenario.friendlyId,sampleScenario.steps[0].id);
            $httpBackend.flush();
            expect(state.go).toHaveBeenCalledWith('taskStep.view',{friendlyId:sampleScenario.friendlyId, stepIndex:++(sampleStepIndex.index),config:sampleTaskStepConfig});
        });

        /*it('should redirect to libraryStep.view on click on library step',function() {
            scope.onLibraryStepListClick(sampleScenario.steps[0].skills[0].skillId,sampleScenario.steps[0].id);
            expect(state.go).toHaveBeenCalledWith('libraryStep.view',{app:sampleScenario.taskId.app, stepId:sampleScenario.steps[0].id, config:sampleLibraryStepConfig});
        });*/


         it('should redirect to next state if skill has taskSteps on grid click', function () {
            scope.onGridClick(sampleScenario.steps[0].skills[0]);
            expect(state.go).toHaveBeenCalledWith('skill.browse.2',{app:sampleScenario.taskId.app, skill:sampleScenario.steps[0].skills[0].skillId});
         });

         it('should show notification when skill has no taskSteps on grid click', function () {
             scope.onGridClick(wrongData);
             expect(notification.showNotification).toHaveBeenCalled();
         });

        it('should show add Step pop-up when click on add-Library-Step icon present in grid', function () {
            event = jasmine.createSpyObj('event', ['stopPropagation']);
            scope.addLibraryStep(sampleScenario.steps[0].skills[0],event);
            expect(scope.addStepPopupConfig).toBeDefined();
            expect(event.stopPropagation).toHaveBeenCalled();
            expect(template.find('.modal-dialog')).toBeTruthy();
            expect(template.find('.add-step-modal')).toBeTruthy();
        });

        it('should show add Step pop-up when click on add-Library-Step button present in header', function () {
            scope.commonData.selectedSkill = sampleScenario.steps[0].skills[0];
            scope.addLibraryStepFromList();
            expect(scope.addStepPopupConfig).toBeDefined();
            expect(scope.stepData.skills).toEqualData(sampleScenario.steps[0].skills[0]);
            expect(template.find('.modal-dialog')).toBeTruthy();
            expect(template.find('.add-step-modal')).toBeTruthy();
        });

        it('should show copy step pop-up on click on copy button',function(){
            scope.commonData.selectedSkill = sampleScenario.steps[0].skills[0];
            scope.copyLibraryStep(type.library,sampleLibraryStep._id,sampleLibraryStep.text,sampleLibraryStep.name);
            expect(scope.addStepPopupConfig).toBeDefined();
            expect(scope.stepData.sourceStepId).toEqualData(sampleLibraryStep._id);
            expect(scope.stepData.sourceName).toEqualData(sampleLibraryStep.name);
            expect(scope.stepData.sourceType).toEqualData(type.library);
            expect(scope.stepData.skills).toEqualData(sampleScenario.steps[0].skills[0]);
            expect(template.find('.modal-dialog')).toBeTruthy();
            expect(template.find('.add-step-modal')).toBeTruthy();
        });

        it('should show export step pop-up on click on export button',function(){
            scope.commonData.selectedSkill = sampleScenario.steps[0].skills[0];
            scope.exportTaskStep(type.task,sampleScenario.steps[0].id,sampleScenario.steps[0].text);
            expect(scope.addStepPopupConfig).toBeDefined();
            expect(scope.stepData.sourceStepId).toEqualData(sampleScenario.steps[0].id);
            expect(scope.stepData.sourceType).toEqualData(type.task);
            expect(scope.stepData.skills).toEqualData(sampleScenario.steps[0].skills[0]);
            expect(template.find('.modal-dialog')).toBeTruthy();
            expect(template.find('.add-step-modal')).toBeTruthy();
        });

        it('should check the else condition that addButton is not present if user is not able to edit the content',function(){
            var newSkillBrowseController;
            inject(function($controller) {
                scope.authentication.user = {
                    roles : ['Content Reviewer']
                };
                $httpBackend.expect('GET','/products/'+sampleScenario.taskId.product+'/skills/taskSteps/count')
                    .respond(sampleCountList);
                $httpBackend.expect('GET','/product/'+sampleScenario.taskId.product+'/skills/librarySteps/count')
                    .respond(sampleCountList);
                newSkillBrowseController = $controller('SkillBrowseController', {
                    $scope: scope,
                    $element :template
                });
                $httpBackend.flush();
                expect(template.find('.add-step').length).toEqual(0);
            });
        });

        afterEach(function() {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });
    });
});
