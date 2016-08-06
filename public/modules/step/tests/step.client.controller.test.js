'use strict';

define(['stepModule', 'testData/scenario', 'testData/step', 'testData/methodTypeEnum', 'angularMocks'], function (app, sampleScenario, sampleStepJson, sampleMethodTypes) {

    describe('stepController', function () {
        var scope,
            $httpBackend,
            state,
            stateParams,
            stepViewerController,
            $templateCache,
            $compile,
            template,
            $timeout,
            $location;
        var sampleFriendlyId = sampleScenario.friendlyId;
        var sampleStepIndex = 1;
        var sampleStepClick = 2;
        var samplePutResponse = {'resp': 'Dummy Step Json Put Response'};
        var sampleSiblingsResponse = ['Dummy Siblings Response'];
        // Load the main application module
        beforeEach(module(ApplicationConfiguration.applicationModuleName, function ($translateProvider) {
            $translateProvider.translations('en', {});
        }));

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
        // turn on spy function on state.go
        beforeEach(inject(function ($state) {
            spyOn($state, 'go');
        }));
        beforeEach(inject(function ($controller, _$httpBackend_, _$timeout_, $rootScope, _$state_, _$stateParams_, _$templateCache_, _$compile_, _$location_) {
            $timeout = _$timeout_;
            scope = $rootScope.$new();
            scope.stepNewCommentCountArray = {};
            spyOn(scope, '$emit');
            $location = _$location_;
            state = _$state_;
            stateParams = _$stateParams_;
            stateParams.friendlyId = sampleFriendlyId;
            stateParams.stepIndex = sampleStepIndex;
            scope.scenario = sampleScenario;
            $templateCache = _$templateCache_;
            $compile = _$compile_;
            template = $($compile($templateCache.get('step.client.view.html'))(scope));
            $httpBackend = _$httpBackend_;
            $httpBackend.whenGET('scenarios/' + stateParams.friendlyId + '?includeActions=false').respond(sampleScenario);
            $httpBackend.whenGET('scenarios/' + stateParams.friendlyId + '/steps/' + (stateParams.stepIndex - 1)).respond(sampleStepJson);
            stepViewerController = $controller('stepController', {$scope: scope, $state: state, $element: template});
            scope.getViewerHeight();
            $httpBackend.flush();
        }));

        //Test Controller Contructor Function
        it('Test Controller Contructor Function', function () {
            expect(scope.stepIndex).toBe(sampleStepIndex);
            expect(scope.friendlyId).toBe(sampleFriendlyId);
            expect(scope.methodTypes).toEqualData([]);
            expect(scope.stepJson).toEqualData(sampleStepJson);
            expect(scope.$emit).toHaveBeenCalledWith('hideLoader');
        });


        it('State Change on clicking different step in step Viewer', function () {
            scope.onStepClickInViewer(sampleStepClick);
            expect(state.go).toHaveBeenCalledWith(state.current.name, {stepIndex: sampleStepClick});
        });

        it('No state change on clicking on the same State in step Viewer', function () {
            scope.onStepClickInViewer(sampleStepIndex);
            expect(state.go).not.toHaveBeenCalled();
        });

        it('State Change on clicking different step in step Editor', function () {
            scope.onStepClickInEditor(sampleStepClick);
            expect(state.go).toHaveBeenCalledWith('content.task.scenario.step.edit', {stepIndex: sampleStepClick});
        });
        it('No state change on clicking same step in step Editor', function () {
            state.go.calls.reset();
            scope.onStepClickInEditor(sampleStepIndex);
            expect(state.go.calls.count()).toBe(0);
        });
        //save  Data Test
        it('Put Request on calling save Data', function () {
            sampleStepJson.friendlyId = sampleFriendlyId;
            sampleStepJson.text = 'Updated Step Text';
            scope.stepJson.text = 'Updated Step Text';
            scope.stepJson.friendlyId = sampleFriendlyId;
            $httpBackend.expectPUT('scenarios/' + stateParams.friendlyId + '/steps/' + scope.stepJson._id, scope.stepJson).respond(samplePutResponse);
            scope.saveData();
            $httpBackend.flush();
            expect(scope.scenario.steps[scope.stepIndex - 1].text).toEqual(sampleStepJson.text);
        });
        //Delete Data Test
        it('Delete Request on calling delete Data', function () {
            sampleStepJson.friendlyId = sampleFriendlyId;
            $httpBackend.expectDELETE('scenarios/' + stateParams.friendlyId + '/steps/' + sampleStepJson._id).respond(sampleScenario);
            scope.deleteStep();
            $httpBackend.flush();
            $timeout.flush();
            expect(state.go).toHaveBeenCalledWith('content.task.scenario');
        });
        it('State Change on Editor Close', function () {
            scope.editorClose();
            expect(state.go).toHaveBeenCalledWith('content.task.scenario.step.view');
        });
        it('Get Step Method Types get Call on executing getMethodTypes Function', function () {
            scope.$emit.calls.reset();
            $httpBackend.expectGET('steps/methodTypes').respond(sampleMethodTypes);
            scope.getMethodTypes();
            var sampleMethodTypesArray = [];
            sampleMethodTypes.forEach(function (element) {
                sampleMethodTypesArray.push(element.name);
            });
            $httpBackend.flush();
            //Check Hide Loader is not called as StepEditor has not intialised
            expect(scope.$emit).not.toHaveBeenCalledWith('hideLoader');
            expect(scope.methodTypes).toEqualData(sampleMethodTypesArray);
        });

        it('Loader hides when StepEditorInitialises and getMethodTypes get Call has Resolved', function () {
            scope.$emit.calls.reset();
            $httpBackend.expectGET('steps/methodTypes').respond(sampleMethodTypes);
            scope.getMethodTypes();
            $httpBackend.flush();
            scope.onStepEditorInitialise();
            expect(scope.$emit).toHaveBeenCalledWith('hideLoader');
        });
        it('Testing Scenario Siblings get Call on viewContentLoaded Event Trigger in Edit Mode', function () {
            state.current.name = 'content.task.scenario.step.edit';
            $httpBackend.whenGET('scenarios/' + stateParams.friendlyId + '/siblings?hasSteps=true&isEditable=true').respond(sampleSiblingsResponse);
            scope.$broadcast('$viewContentLoaded');
            $httpBackend.flush();
            expect(scope.scenarioSiblings).toEqualData(sampleSiblingsResponse);
        });
        it('Testing Scenario Siblings get Call on viewContentLoaded Event Trigger in View Mode', function () {
            state.current.name = 'content.task.scenario.step.view';
            $httpBackend.whenGET('scenarios/' + stateParams.friendlyId + '/siblings?hasSteps=true&isEditable=false').respond(sampleSiblingsResponse);
            scope.$broadcast('$viewContentLoaded');
            $httpBackend.flush();
            expect(scope.scenarioSiblings).toEqualData(sampleSiblingsResponse);
        });
        //Get Viewer Height Function To Be Tested
        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });

    });
});

