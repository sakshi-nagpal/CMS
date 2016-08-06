
define(['testData/scenario', 'scenarioModule', 'angularMocks'], function (sampleScenario) {
    describe('stepListViewDirective', function () {

        var $compile,
            $rootScope,
            element,
            scope;

        // Load the main application module
        beforeEach(module(ApplicationConfiguration.applicationModuleName, function ($translateProvider) {
            $translateProvider.translations('en', {});
        }));

        // Store references to $rootScope and $compile
        // so they are available to all tests in this describe block
        beforeEach(inject(function (_$compile_, _$rootScope_) {

            // The injector unwraps the underscores (_) from around the parameter names when matching
            $compile = _$compile_;
            $rootScope = _$rootScope_;
            scope = $rootScope.$new();
            scope.phaseCode = 'AUT';
            scope.sampleText = 'Dummy Object'
            element = angular.element('<div><button class="dummy-element" phase-editable="phaseCode">{{sampleText}}</button></div>');

            // Compile a piece of HTML containing the directive
            element = $compile(element)(scope);

            // fire all the watches, so the scope expressions will be evaluated
            scope.$apply();
        }));

        it('Element should be present if phase is editable', function() {
            expect(element.html()).toContain(scope.sampleText);

        });

        it('Element should be removed if phase is not editable ', function() {
            scope.phaseCode = 'DEV';
            element = angular.element('<div><button class="dummy-element" phase-editable="phaseCode">{{sampleText}}</button></div>');
            element = $compile(element)(scope);
            scope.$apply();

            expect(element.html()).not.toContain(scope.sampleText);
        });
    });
});
