'use strict';

define(['testData/scenario','stepViewerModule', 'angularMocks'], function (sampleScenario) {
    describe('stepViewerDirective', function () {
        var element,
            scope,
            $compile;
        var sampleStepIndex = 1;
        // Load the main application module
        beforeEach(module(ApplicationConfiguration.applicationModuleName, function ($translateProvider) {
            $translateProvider.translations('en', {});
        }));
        beforeEach(inject(function (_$compile_, _$rootScope_, _$state_) {
            scope = _$rootScope_.$new();
            scope.scenario = sampleScenario;
            scope.stepIndex = sampleStepIndex;
            scope.onChangeStep = function(){

            };
            $compile = _$compile_;
            element = $compile('<step-header  scenario="scenario" step-switch="true" step-index="stepIndex" on-change-step="onChangeStep(index)"></step-header>')(scope);
            scope.$digest();
            scope = element.isolateScope() || element.scope();

        }));
        it('Template Render on using directive with step switch feature',function(){
            expect(scope.stepSwitch).toBe(true);
            expect(element.html()).toContain(sampleScenario.friendlyId);
            //Check if Element with step_switch_header exists in template
            expect(element.find('.step_switch_header').length).toBe(1);
            //check if number of divs with class step-index are same as number of  steps in scenario Json
            expect(element.find('.step_switch_header .steps .step-index').length).toBe(sampleScenario.steps.length);
        });
        it('Template Render on using directive without step switch feature',function() {
            element = $compile('<step-header  scenario="scenario"></step-header>')(scope);
            scope.$digest();
            scope = element.isolateScope() || element.scope();
            expect(scope.stepSwitch).toBe(false);
            //expect(element.html()).toContain('GO13.AC13.03.3A.02.A2');
            expect(element.find('.step_switch_header').length).toBe(0);
        });
        it('onChangeStep function called on clicking any step-index',function(){
            spyOn(scope, 'onChangeStep');
            element.find('.step_switch_header .steps .step-index').triggerHandler('click');
            expect(scope.onChangeStep).toHaveBeenCalledWith({index:1});
        });
        it('getTooltipText returns text from any html',function(){
            expect(scope.getTooltipText(sampleScenario.steps[0].text)).toEqual(angular.element('<div>'+sampleScenario.steps[0].text+'</div>').text());
        });
    });
});
