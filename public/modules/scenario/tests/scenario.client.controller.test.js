'use strict';

define(['testData/scenario', 'testData/scenarioSkills', 'scenarioModule', 'angularMocks'], function (sampleScenario, scenarioSkills) {
    describe('scenarioController', function () {
        var scope,
            rootScope,
            $httpBackend,
            $controller,
            $filter,
            template,
            $timeout,
            state,
            stateParams,
            samplePhaseCode,
            viewerController;
        var sampleFriendlyId = sampleScenario.friendlyId;
        var sampleStepIndex = 1;
        var sampleScenariosByTaskIdResponse = [{
            'friendlyId': sampleScenario.friendlyId,
            type: {code: sampleScenario.type}
        }, {'friendlyId': 'GO13.WD13.03.3B.02.A1', type: {code: 'A1'}}];

        var sampleStepId = '55558ca626c2edd81cfef0ec';
        var sampleStepIndex = 1;
        var sampleStepConfig = {
            'isPopupMode': false,
            'stateToGo': 'content.task.scenario',
            'isScenarioSwitchable': true,
            'stateToGoParams': {},
            'isEditable': true
        };
        samplePhaseCode = 'CQA';
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
        beforeEach(inject(function (_$controller_, _$httpBackend_, $rootScope, _$state_, _$stateParams_, _$filter_, _$timeout_) {
            rootScope = $rootScope;
            scope = $rootScope.$new();
            spyOn(scope, '$emit');
            state = _$state_;
            $filter = _$filter_;
            scope.stepNewCommentCountArray = [];
            scope.scenarioNewCommentCount = 0;
            scope.paintTaskViewerHeader = function () {
            };
            scope.task = {
                _id: '5593c6a6671702c4064ed569',
                app: 'Word',
                data: {
                    friendlyId: sampleFriendlyId.slice(0, sampleFriendlyId.lastIndexOf('.'))
                }
            };
            stateParams = _$stateParams_;
            stateParams.friendlyId = sampleFriendlyId;
            stateParams.taskId = null;
            $controller = _$controller_;
            $httpBackend = _$httpBackend_;
            $timeout = _$timeout_;
            $httpBackend.expect('GET', 'scenarios/' + stateParams.friendlyId + '?includeActions=false').respond(sampleScenario);
            $httpBackend.expect('GET', 'task/' + sampleScenario.taskId + '/scenarios' + '?hasSteps=true').respond(sampleScenariosByTaskIdResponse);
            viewerController = $controller('scenarioController', {
                $scope: scope,
                $state: state,
                $filter: $filter,
                $element: $('<div></div>'),
                $timeout: $timeout
            });
            $httpBackend.flush();
            $timeout.flush();
            expect(scope.$emit).toHaveBeenCalledWith('hideLoader');
        }));
        it('Controller Function Test For Valid Scenario and exists', function () {
            expect(scope.scenario).toEqualData(sampleScenario);
            expect(scope.taskId).toEqual(sampleScenario.taskId);
            expect(scope.copyScenario).toBeDefined();
            expect(scope.scenarioSkills).toEqualData(scenarioSkills);
        });

        it('Controller Function Test For Valid Scenario But not exists', function () {
            scope = rootScope.$new();
            scope.paintTaskViewerHeader = function () {
            };
            scope.task = {
                app: 'Word 2013',
                data: {}
            };
            $httpBackend.expect('GET', 'scenarios/' + stateParams.friendlyId + '?includeActions=false').respond({taskId: sampleScenario.taskId});
            $httpBackend.expect('GET', 'task/' + sampleScenario.taskId + '/scenarios' + '?hasSteps=true').respond(sampleScenariosByTaskIdResponse);
            viewerController = $controller('scenarioController', {
                $scope: scope,
                $state: state,
                $filter: $filter,
                $element: template
            });
            $httpBackend.flush();
            expect(scope.taskId).toEqual(sampleScenario.taskId);
            expect(scope.scenario).not.toBeDefined();
            expect(scope.copyScenario).toBeDefined();
        });
        it('Controller Function Test For Invalid Scenario', function () {
            scope = rootScope.$new();
            scope.paintTaskViewerHeader = function () {
            };
            scope.task = {
                app: 'Word 2013',
                data: {}
            };
            $httpBackend.expect('GET', 'scenarios/' + stateParams.friendlyId + '?includeActions=false').respond(404);
            viewerController = $controller('scenarioController', {
                $scope: scope,
                $state: state,
                $filter: $filter,
                $element: template
            });
            $httpBackend.flush();
            expect(scope.scenario).not.toBeDefined();
            expect(scope.taskId).not.toBeDefined();
            expect(state.go).toHaveBeenCalledWith('dashboard');
        });
        it('OnBlankScenario Click Callback Test', function () {
            scope.scenario = undefined;
            $httpBackend.expect('POST', 'scenarios/' + stateParams.friendlyId + '?taskId=' + scope.task._id).respond(sampleScenario);
            scope.onBlankScenarioClick();
            $httpBackend.flush();
            expect(scope.scenario).toEqualData(sampleScenario);
            expect(scope.scenarioSkills).toEqualData(scenarioSkills);
        });
        it('State Change Event Handler on state Change Step Viewer to Scenario Viewer', function () {
            var toState = {name: 'content.task.scenario'};
            var fromState = {name: 'content.task.scenario.step.view'};
            var toParams = {friendlyId: sampleFriendlyId};
            var fromParams = {};
            $httpBackend.expect('GET', 'scenarios/' + stateParams.friendlyId + '?includeActions=false').respond(sampleScenario);
            $httpBackend.expect('GET', 'task/' + sampleScenario.taskId + '/scenarios' + '?hasSteps=true').respond(sampleScenariosByTaskIdResponse);
            rootScope.$broadcast('$stateChangeStart', toState, toParams, fromState, fromParams);
            expect(scope.$emit).toHaveBeenCalledWith('hideLoader');
            $httpBackend.flush();
        });
        it('State Change Event Handler on state Change Scenario Viewer to Scenario Viewer with FriendlyId change', function () {
            var toState = {name: 'content.task.scenario'};
            var fromState = {name: 'content.task.scenario'};
            var toParams = {friendlyId: sampleFriendlyId, taskId: sampleScenario.taskId};
            var fromParams = {};
            rootScope.$broadcast('$stateChangeStart', toState, toParams, fromState, fromParams);
            expect(toParams.taskId).toBeNull();
        });
        it('State Change Event Handler on state Change Step Viewer to Scenario Viewer with different FriendlyId', function () {
            var friendlyId = 'GO13.AC13.03.3A.03.A2';
            var toState = {name: 'content.task.scenario'};
            var fromState = {name: 'content.task.scenario.step.view'};
            var toParams = {friendlyId: friendlyId, taskId: sampleScenario.taskId};
            var fromParams = {};
            $httpBackend.expect('GET', 'scenarios/' + friendlyId + '?includeActions=false').respond(sampleScenario);
            $httpBackend.expect('GET', 'task/' + sampleScenario.taskId + '/scenarios' + '?hasSteps=true').respond(sampleScenariosByTaskIdResponse);
            rootScope.$broadcast('$stateChangeStart', toState, toParams, fromState, fromParams);
            expect(toParams.taskId).toBeNull();
            expect(scope.$emit).toHaveBeenCalledWith('hideLoader');
            $httpBackend.flush();
        });
        it('State Change on Step Click', function () {
            scope.onStepClick(sampleStepIndex);
            expect(state.go).toHaveBeenCalledWith('content.task.scenario.step.view', {
                stepIndex: sampleStepIndex,
                config: sampleStepConfig
            });
        });
        it('State Change on Click on Tagging Button', function () {
            scope.tagSkill(sampleStepIndex);
            expect(state.go).toHaveBeenCalledWith('skillPopup.tag.grid', {
                friendlyId: sampleFriendlyId,
                stepNum: sampleStepIndex,
                app: scope.task.app
            });
        });
        it('Put call to update steps on reordering steps', function () {
            $httpBackend.expect('PUT', 'scenarios/' + sampleScenario.friendlyId + '/steps/' + sampleStepId + '/index/' + sampleStepIndex + '/reorder').respond('true');
            //$httpBackend.expect('GET','scenarios/'+stateParams.friendlyId+'?includeActions=false').respond(sampleScenario);
            //$httpBackend.expect('GET','task/'+sampleScenario.taskId+'/scenarios' + '?hasSteps=true').respond(sampleScenariosByTaskIdResponse);
            scope.reorderSteps(sampleStepId, sampleStepIndex);
            $httpBackend.flush();
        });
        it('PUT call to update phase change returns list of errors', function () {
            var errors = {"requiredDocuments": {"Start Doc": true, "End Doc": true}};
            scope.scenario.phase.code = samplePhaseCode;
            $httpBackend.expect('PUT', 'scenarios/' + sampleScenario.friendlyId + '/phase/' + scope.scenario.phase.code + '/transition').respond(errors);
            scope.changePhase(samplePhaseCode);
            $httpBackend.flush();
        });
        it('PUT call to update phase change returns with status 403', function () {

            $httpBackend.expect('PUT', 'scenarios/' + sampleScenario.friendlyId + '/phase/' + scope.scenario.phase.code + '/transition').respond(403, {result: 'you are not allowed to change the phase'});
            scope.changePhase(samplePhaseCode);
            $httpBackend.flush();
            expect(scope.phaseChange).toBeDefined();
        });

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });
    });

});
