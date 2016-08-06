'use strict';


define(['libraryStepModule', 'angularMocks'], function(app) {
    describe('libraryStepController', function() {

        //Initialize global variables
        var scope,
            LibraryStepController,
            state,
            stateParams,
            $httpBackend,
            template,
            $timeout;

        var stepDetails =[
            {
            friendlyId :'1.2.3',
            stepNo : '1'
            },
            {
                friendlyId :'1.4.3',
                stepNo : '4'
            },
            {
                friendlyId :'1.2.3',
                stepNo : '7'
            }
        ];

        var stepId = '55558ca626c2edd81cfef0e9';
        var stepJson = {
            name: 'New step',
            creatorId :'123',
            mappedStepsDetail :[],
            createdBy :{
                displayName :'Dummy Name'
            },
            text:'Step Text'
        };

        var methodTypes =[
            {
                name: 'KeyBoard'
            },
            {
                name: 'Ribbon'
            },
            {
                name: 'Mouse'
            }
        ];

        // Load the main application module

        beforeEach(module(ApplicationConfiguration.applicationModuleName, function ($translateProvider) {
            $translateProvider.translations('en', {});
        }));



        beforeEach(inject(function($controller, $rootScope,_$state_,_$stateParams_,_$httpBackend_,_$timeout_,
                                   _$compile_,_$templateCache_) {
            scope = $rootScope.$new();
            state = _$state_;
            stateParams=_$stateParams_;
            stateParams.id = '55558ca626c2edd81cfef0e9';
            stateParams.app = 'Word';
            stateParams.config={
                stateToGo : 'skill.browse.2',
                stateToGoParams: {
                    app: 'Word',
                    skill: {
                        skillId: '123'
                    }
                }
            };
            $httpBackend = _$httpBackend_;
            $timeout=_$timeout_;
            scope.methodTypes = [];
            $httpBackend.expect('GET','library/step/'+stepId)
                .respond(stepJson);
            $httpBackend.expect('GET','library/step/'+stepId+'/mapped/tasks')
                .respond(stepDetails);

            template = $(_$compile_(_$templateCache_.get('library.step.client.view.html'))(scope));
            spyOn(scope, '$emit');
            LibraryStepController = $controller('libraryStepController', {
                $scope: scope,
                $element :template,
                $state: state
            });
            scope.getViewerHeight();
            $httpBackend.flush();
            scope.$digest();
        }));


       it('should check if scope variables are defined',function(){
            expect(scope.stepJson.name).toEqual('New step');
            expect(scope.stepJson.creatorName).toEqual('Dummy Name');

        });

         it('should get method Types on calling getMethodTypes and then call hideLoader',function() {
             scope.$emit.calls.reset();
             scope.getMethodTypes();
             $httpBackend.expect('GET','steps/methodTypes')
                 .respond(methodTypes);
             $httpBackend.flush();
             scope.onStepEditorInitialise();
             expect(scope.methodTypes.length).toEqual(3);
             expect(scope.$emit).toHaveBeenCalledWith('hideLoader');
        });


        it('update request on calling save Data', function () {
            spyOn(scope, 'editorClose').and.callThrough();
            spyOn(state, 'go');
            stepJson.text = 'Updated Step Text';
            scope.stepJson.text = 'Updated Step Text';
            $httpBackend.expectPUT('library/step/' + stepId, scope.stepJson).respond(stepJson);
            $httpBackend.expect('GET','library/step/'+stepId).respond(stepJson);
            $httpBackend.expect('GET', 'library/step/' + stepId + '/mapped/tasks').respond(stepDetails);
            scope.saveData();
            expect(scope.errorMessage).toEqual('');
            scope.editorClose();
            $httpBackend.flush();
            expect(scope.editorClose).toHaveBeenCalled();
            expect(state.go).toHaveBeenCalled();
        });

        it('error msg should be shown on saving blank step name', function () {
            scope.stepJson.name = '';
            scope.saveData();
            expect(scope.errorMessage).toEqual('library.addStepModal.label_addStep_error_blank_message');
        });

        it('error msg should be shown on saving duplicate step name', function () {
            $httpBackend.expectPUT('library/step/' + stepId, scope.stepJson).respond(400,{
                'message':'Library Step Name must be unique.'
            });
            scope.saveData();
            $httpBackend.flush();
            expect(scope.errorMessage).toEqual('library.addStepModal.label_addStep_error_message');
        });

        it('should launch skill.browse.1 if stepCount <= 1 if user deletes step', function () {
            spyOn(state, 'go');
            $httpBackend.expectDELETE('library/step/'+stepId).respond(stepJson);
            scope.deleteStep();
            $httpBackend.flush();
            expect(state.go).toHaveBeenCalledWith('skill.browse.1', {app: stateParams.app});
        });

        it('should launch scope.stateConfig state if stepCount > 1 if user deletes step ', function () {
            spyOn(state, 'go');
            $httpBackend.expectDELETE('library/step/'+stepId).respond(stepJson);
            scope.stateConfig.stateToGoParams ={
                stepCount : 2
                };
            scope.deleteStep();
            expect(scope.$emit).toHaveBeenCalledWith('showLoader');
            $httpBackend.flush();
            expect(state.go).toHaveBeenCalledWith(scope.stateConfig.stateToGo, {app: scope.stateConfig.stateToGoParams.app, skill:scope.stateConfig.stateToGoParams.skill});
        });

        it('stepClose should close the viewer and launch scope.stateConfig.stateToGo if stateConfig exists', function () {
            spyOn(state, 'go');
            scope.onStepClose();
            expect(state.go).toHaveBeenCalledWith(scope.stateConfig.stateToGo, {app: scope.stateConfig.stateToGoParams.app, skill:scope.stateConfig.stateToGoParams.skill});
        });

        it('stepClose should close the viewer and launch skill.browse.1 if there is no stateConfig', function () {
            spyOn(state, 'go');
            scope.stateConfig= null;
            scope.onStepClose();
            expect(state.go).toHaveBeenCalledWith('skill.browse.1', {app: stateParams.app});
        });

        afterEach(function() {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });
    });
});
