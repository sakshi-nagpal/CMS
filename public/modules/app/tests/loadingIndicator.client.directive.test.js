'use strict';

define(['appModule', 'angularMocks'], function () {
    describe('Testing Loading Indicator', function () {
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

            // Compile a piece of HTML containing the directive
            element = $compile('<div id="dummyWrapper"><loading-indicator> </loading-indicator></div>')($rootScope);

            // fire all the watches, so the scope expressions will be evaluated
            $rootScope.$digest();
        }));

        it('check loading indicator is not shown initially', function () {

          expect($(element).find('#dummyWrapper').children().length).toEqual(0);

        });

        it('check if isLoading is set to true on "showLoader" event', function () {

            $rootScope.$broadcast('showLoader');
            expect($rootScope.isLoading).toBeTruthy();

        });

        it('check if isLoading is set to false on "hideLoader" event', function () {

            $rootScope.$broadcast('hideLoader');
            expect($rootScope.isLoading).toBeFalsy();

        });

        it('should check if isLoading is true when loadingIconRequired is true', function() {
            $rootScope.$broadcast('$stateChangeStart',{toState:{loadingIconRequired:true}});
            expect($rootScope.isLoading).toBeTruthy();
        });

    });
});
