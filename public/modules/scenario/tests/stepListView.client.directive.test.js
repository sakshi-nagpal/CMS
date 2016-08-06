'use strict';

define(['testData/scenario', 'scenarioModule', 'commentsModule', 'angularMocks'], function (sampleScenario) {
    describe('stepListViewDirective', function () {

        var $compile,
            $rootScope,
            $state,
            element, elementNew,
            el,
            scope, scopeNew,
            controller,
            methodType;

        // Load the main application module
        beforeEach(module(ApplicationConfiguration.applicationModuleName, function ($translateProvider) {
            $translateProvider.translations('en', {});
        }));

        // Store references to $rootScope and $compile
        // so they are available to all tests in this describe block
        beforeEach(inject(function (_$compile_, _$rootScope_, _$state_) {
            // The injector unwraps the underscores (_) from around the parameter names when matching
            $compile = _$compile_;
            $rootScope = _$rootScope_;
            $state = _$state_;
            scope = $rootScope.$new();
            scope.scenario = sampleScenario;
            scope.onStepClick = function (index) {
            };
            scope.tagSkill = function (index) {
            };
            scope.viewOnly = false;
            element = angular.element('<step-list-view  steps="scenario.steps" on-step-click="onStepClick(index)"tag-skill="tagSkill(index)" view-only="viewOnly"></step-list-view>');

            // Compile a piece of HTML containing the directive
            element = $compile(element)(scope);
            // fire all the watches, so the scope expressions will be evaluated
            scope.$apply();

            scope = element.isolateScope() || element.scope();
        }));

        it('Compiled directive template validation', function () {
            // Check that the compiled element contains the templated content
            expect(scope.steps).toBeDefined();
            expect((scope.skillLabel).length).toBe(scope.steps.length);
            expect(element.find('.scenario-step').length).toBe(scope.steps.length);
        });

        it('view-only mode validation', function () {
            expect(element.find('.tag-icon').length).toBe(scope.steps.length);
            expect(element.find('.comments').length).toBe(scope.steps.length);
            scope.viewOnly = true;
            scope.$digest();
            expect(element.find('.tag-icon').length).toBe(0);
        });

        it('Method call validation on click event', function () {
            spyOn(scope, 'tagSkill').and.callThrough();
            spyOn(scope, 'onStepClick').and.callThrough();
            element.find('.tag-icon').click();
            expect(scope.tagSkill).toHaveBeenCalledWith({index: 1});
            element.find('.scenario-step').eq(0).click();
            expect(scope.onStepClick).toHaveBeenCalledWith({index: 1});
        });

    });
});

