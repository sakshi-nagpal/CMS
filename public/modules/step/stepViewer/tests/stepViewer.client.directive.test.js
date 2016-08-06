'use strict';

define(['stepViewerModule','angularMocks'], function () {
    describe('stepViewerDirective', function () {
        var $compile,
            $rootScope,
            $state,
            element,elementNew,
            el,
            scope,scopeNew,
            isolateScope,
            controller,
            methodType;

        var sampleStepJson = {
            'text' : 'Mark the workbook as final.',
            '_id' : '556d9dad0f24c37c1b2a9d5e',
            'methods' : [
                {
                    'type' : 'Ribbon',
                    '_id' : '556d9dad0f24c37c1b2a9d63',
                    'actions' : [
                        {
                            'text' : 'Click the FILE tab.',
                            '_id' : '556d9dad0f24c37c1b2a9d67'
                        }],
                    'supported' : false,
                    'primary' : true
                }
            ]
        };

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
            scope.stepJson = sampleStepJson;
            scope.stepIndex = '1';
            scope.methodCountKeyMap = {};
            scope.stepJson.methods = sampleStepJson.methods;
            scope.getViewerHeight = function(){};
            element = $compile('<step-viewer step-json="stepJson" step-index="stepIndex" get-viewer-height="getViewerHeight()"></step-viewer>')(scope);
            scope.$apply();
            isolateScope = element.isolateScope() || element.scope();
            controller = element.controller('stepViewer');
        }));

        it('Replaces the element with the appropriate content', function () {
            // Check that the compiled element contains the templated content
            expect(element.html()).toContain(sampleStepJson.text);
            expect(scope.stepJson).toBeDefined();
        });
        
    });
});

