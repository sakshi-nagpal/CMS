'use strict';

define(['importTaskModule', 'angularMocks', 'testData/scenario'], function(i, a, sampleScenario) {
    describe('importTaskController',function(){
        var scope,
            $httpBackend,
            state,
            stateParams,
            timeout,
            importTaskController;
        var sampleFriendlyId = 'GO13.WD13.03.3B.02.T1';
        var sampleSourceFriendlyId = 'GO13.WD13.03.3B.02.A1';
        var sampleStepIndex = 1, sourceFriendlyId = 'EXP13.WD13.01.01.03.T1';
        var sampleStepId = '5593c8c4cbc2c8841dd6e3ab';
        /*var copyScenarioConfirmJson = {
            type: 'warning',
                title: 'Confirm Copy Scenario!',
                body : {
                message : 'Copying content from this scenario will result in loss of all changes made to the target scenario. Are you sure you want to continue?'
            },
            actionButtons : [{
                name : 'Cancel'
            },
                {
                    name : 'Copy Scenario',
                    callback : scope.copyScenario
                }]
        };*/
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
        // turn on spy function on state.go
        beforeEach(inject(function($state) {
            spyOn($state, 'go');
        }));
        beforeEach(inject(function($controller, _$httpBackend_, _$rootScope_, $state, $stateParams, $timeout){
            state = $state;
            stateParams = $stateParams;
            stateParams.friendlyId = sampleFriendlyId;
            stateParams.sourceFriendlyId = sampleSourceFriendlyId;
            stateParams.stepIndex = 1;
            timeout = $timeout;

            scope = _$rootScope_.$new();
            scope.import = {};
            $httpBackend = _$httpBackend_;
            importTaskController = $controller('importTaskController',{$scope:scope, $state:state, $element:$('<div></div>'), $timeout: timeout});
        }));

        it('scope variables got set',function(){
            expect(scope.flag).toEqualData({initialScreen:true});
           // expect(scope.importTask).toEqualData({copyScenarioConfirmJson: copyScenarioConfirmJson});
        });

        //it('scope watch on importTask.sourceFriendlyId works fine',function(){
        //   //---
        //});
        //
        //it('scope.getViewerHeight gets correct height',function(){
        //    //----
        //});

        it('scope.getScenarioByFriendlyID gets scenario',function(){
            spyOn(scope, '$emit');
            scope.getScenarioByFriendlyID(sampleSourceFriendlyId);
            $httpBackend.expect('GET','scenarios/'+stateParams.sourceFriendlyId+'?includeActions=false').respond(sampleScenario);
            $httpBackend.flush();
            expect(scope.scenario).toEqualData(sampleScenario);
            expect(scope.$emit).toHaveBeenCalledWith('hideLoader');
        });


        it('scope.getStepJson gets steps',function(){
            spyOn(scope, '$emit');
            scope.getStepJson(stateParams.friendlyId,stateParams.stepIndex);
            $httpBackend.expect('GET', 'scenarios/' + stateParams.friendlyId + '/steps/'+ (stateParams.stepIndex - 1)).respond(sampleScenario.steps[0]);
            $httpBackend.flush();
            expect(scope.stepJson).toEqualData(sampleScenario.steps[0]);
            expect(scope.$emit).toHaveBeenCalledWith('hideLoader');
        });

        it('scope.onStepClick changes state to \'import.task.scenario.detail\' if in copy scenario mode ',function(){
            scope.importTask.isCopyScenario = true;
            scope.onStepClick(stateParams.stepIndex);
            expect(state.go).toHaveBeenCalledWith('import.task.scenario.detail',{stepIndex:stateParams.stepIndex});
        });

        it('scope.onStepClick changes state to \'import.task.scenario.detail\' if in copy scenario mode ',function(){
            scope.importTask.isCopyScenario = false;
            scope.onStepClick(stateParams.stepIndex);
            expect(state.go).toHaveBeenCalledWith('import.task.step.detail',{stepIndex:stateParams.stepIndex});
        });

        it('scope.onStepClickInViewer doesn\'t change state if step index matches scope value',function(){
            scope.stepIndex = stateParams.stepIndex;
            scope.onStepClickInViewer(stateParams.stepIndex);
            expect(state.go).not.toHaveBeenCalled();
        });

        it('scope.onStepClickInViewer changes state to \'import.task.scenario.detail\' if step index doesn\'t matches scope value in copy scenario mode',function(){
            scope.importTask.isCopyScenario = true;
            scope.stepIndex = stateParams.stepIndex + 1;
            scope.onStepClickInViewer(stateParams.stepIndex);
            expect(state.go).toHaveBeenCalledWith('import.task.scenario.detail',{stepIndex:stateParams.stepIndex});
        });

        it('scope.onStepClickInViewer changes state to \'import.task.step.detail\' if step index doesn\'t matches scope value in copy scenario mode',function(){
            scope.importTask.isCopyScenario = false;
            scope.stepIndex = stateParams.stepIndex + 1;
            scope.onStepClickInViewer(stateParams.stepIndex);
            expect(state.go).toHaveBeenCalledWith('import.task.step.detail',{stepIndex:stateParams.stepIndex});
        });

        it('scope.onStepClickInViewer changes state if step index doesn\'t matches scope value',function(){
            scope.importTask.isCopyScenario = true;
            scope.stepIndex = stateParams.stepIndex + 1;
            scope.onStepClickInViewer(stateParams.stepIndex);
            expect(state.go).toHaveBeenCalledWith('import.task.scenario.detail',{stepIndex:stateParams.stepIndex});
        });

        it('scope.popupClose changes state',function(){
            scope.scenario = {taskId: {_id:'_task_id_'}};
            scope.popupClose(stateParams.friendlyId);
            expect(state.go).toHaveBeenCalledWith('content.task.scenario',{friendlyId:stateParams.friendlyId, taskId:scope.scenario.taskId._id});
        });

        it('scope.copyScenario calls copyScenario which changes state on callback',function(){
            scope.scenario = {taskId: {_id:'_task_id_'}};
            scope.importTask.friendlyId = sampleFriendlyId;
            scope.importTask.sourceFriendlyId = sampleSourceFriendlyId;
            scope.copyScenario();
            $httpBackend.expect('PUT', 'scenarios/'+stateParams.friendlyId+'/source/'+sampleSourceFriendlyId+'/copy?includeAttachments=false').respond(sampleScenario);
            $httpBackend.flush();
            timeout.flush();
            expect(state.go).toHaveBeenCalled();//With('content.task.scenario',{friendlyId:stateParams.friendlyId, taskId:scope.scenario.taskId._id});
        });

        it('scope.importStep calls importStep which changes state on callback',function(){
            scope.scenario = {taskId: {_id:'_task_id_'}};
            scope.stepIndex = sampleStepIndex;
            scope.importStep(stateParams.friendlyId,sourceFriendlyId,sampleStepId);
            $httpBackend.expect('PUT', 'scenarios/'+stateParams.friendlyId+'/source/'+sourceFriendlyId+'/import/step/'+sampleStepId).respond(sampleScenario);
            $httpBackend.flush();
            timeout.flush();
            expect(state.go).toHaveBeenCalled();
        });

        it('scope.goBack changes state to import scenario if in copy scenario mode ',function(){
            scope.importTask.isCopyScenario = true;
            scope.goBack(stateParams.friendlyId,sourceFriendlyId);
            expect(state.go).toHaveBeenCalledWith('import.task.scenario',{friendlyId:stateParams.friendlyId,sourceFriendlyId:sourceFriendlyId});
        });

        it('scope.goBack doesn\'nt changes state to import scenario if not in copy scenario mode ',function(){
            scope.importTask.isCopyScenario = false;
            scope.goBack(stateParams.friendlyId,sourceFriendlyId);
            expect(state.go).not.toHaveBeenCalledWith('import.task.scenario',{friendlyId:stateParams.friendlyId,sourceFriendlyId:sourceFriendlyId});
        });

        it('scope.goBack changes state to import step if not in copy scenario mode ',function(){
            scope.importTask.isCopyScenario = false;
            scope.goBack(stateParams.friendlyId,sourceFriendlyId);
            expect(state.go).toHaveBeenCalledWith('import.task.step',{friendlyId:stateParams.friendlyId,sourceFriendlyId:sourceFriendlyId});
        });

        afterEach(function() {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });
    });

});
