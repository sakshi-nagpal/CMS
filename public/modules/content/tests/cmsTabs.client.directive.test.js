'use strict';

define(['contentModule', 'angularMocks'], function () {
    describe('Testing CMS Tabs', function () {
        var $compile,
            $rootScope,
            $state,
            element;

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
            $rootScope.tabData = [
                {name:'Tab 1', stateRef:'content.hierarchy1.0'},
                {name:'Tab 2', stateRef:'content.hierarchy1.1'}
            ];

            // Compile a piece of HTML containing the directive
            element = $compile('<cms-tabs obj="tabData"></cms-tabs>')($rootScope);
            // fire all the watches, so the scope expressions will be evaluated
            $rootScope.$digest();
        }));

        it('Replaces the element with the appropriate content', function () {
            // Check that the compiled element contains the templated content
            expect(element.html()).toContain('Tab 1');
        });
    });
});
