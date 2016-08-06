'use strict';

define(['skillImportModule', 'angularMocks'], function () {
    describe('Testing StateChooser', function () {
        var $compile,
            controller,
            $scope,
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
            $scope = _$rootScope_.$new();
            $scope.stateData = {};
            $scope.stateData = [
                {
                    stateText:'CHOOSE SKILL'
                },
                {
                    stateText:'CHOOSE SOURCE STEP'
                },
                {
                    stateText:'REVIEW METHOD AND CONFIRM'
                }
            ];

            $scope.currentStateIndex = 1;

            $scope.changeState = function($index){};

            // Compile a piece of HTML containing the directive
            element = $compile('<state-chooser on-state-change="changeState(data)" state-data="stateData" current-state-index="currentStateIndex"></state-chooser>')($scope);
            // fire all the watches, so the scope expressions will be evaluated
            controller = element.controller('stateChooser');
            $scope.$apply();

            $scope = element.isolateScope();
            $(document).find('body').append(element);

        }));

        it('check the scope variables', function () {

            expect($scope.stateData.length).toEqual(3);
            expect($scope.currentStateIndex).toEqual(1);
        });
        it('State Change Callback should trigger on Icon Click', function () {


            spyOn($scope,'onStateChange').and.callThrough();
            spyOn($scope,'onStateClick').and.callThrough();

            var icon = element.find('.state-icon').eq(0);

            icon.trigger('click');
            expect($scope.onStateChange).toHaveBeenCalled();
            expect($scope.onStateClick).toHaveBeenCalled();



        });
        it('State Change Callback should trigger on text Click', function () {

            spyOn($scope,'onStateChange').and.callThrough();
            spyOn($scope,'onStateClick').and.callThrough();

            var text = element.find('.state-info').eq(0);
            text.trigger('click');
            expect($scope.onStateClick).toHaveBeenCalled();
            expect($scope.onStateChange).toHaveBeenCalled();

        });



    });
});
