'use strict';

define(['appModule','angularMocks'], function () {
    describe('stepMethodDirective', function () {
        var $compile,
            $rootScope,
            $state,
            element,
            scope,
            isolateScope,
            controller;

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
            scope.stepJson.methods = sampleStepJson.methods;
            element = $compile('<step-method methods="stepJson.methods"></step-method>')(scope);
            scope.$apply();
            isolateScope =  element.isolateScope() ||element.scope();
            controller = element.controller('stepMethod');
        }));


        it('scope.updateMethodCountKeyMap should update the method count key map', function () {
            isolateScope.updateMethodCountKeyMap(sampleStepJson.methods.type);
         expect(isolateScope.methodCountKeyMap[sampleStepJson.methods.type]).toEqual(1);
            isolateScope.updateMethodCountKeyMap(sampleStepJson.methods.type);
         expect(isolateScope.methodCountKeyMap[sampleStepJson.methods.type]).toEqual(2);
         });
    });
});

