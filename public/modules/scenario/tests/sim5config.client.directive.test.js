/**
 * Created by SakshiN on 10/17/2015.
 */

'use strict';

define(['scenarioModule', 'angularMocks'], function () {
    describe('sim5configDirective', function () {

        var $compile,
            $rootScope,
            $state,
            scope,
            element,
            $controller,
            $httpBackend,
            $document,
            $window,
            $timeout;

        var role = 'contentAuthor';
        var configData = [
            {
                _id: 1,
                env: 'dev',
                label: "SIM5 - Dev",
                type: "basic"
            }
        ];

        var configData2 = [
            {
                _id: 1,
                env: 'dev',
                label: "SIM5 - Dev",
                type: "basic"
            },
            {
                _id: "561b8208222940a2628a4a14",
                env: "stage",
                label: "SIM5 - Stage",
                type: "basic"
            },
            {
                _id: "561b8208222940a2628a4a15",
                env: "prod",
                label: "SIM5 - Prod",
                type: "basic"
            }
        ];

        beforeEach(function() {
            jasmine.addMatchers({
                toEqualData: function(util, customEqualityTesters) {
                    return {
                        compare: function(actual, expected) {
                            return {
                                pass: angular.equals(actual, expected)
                            };
                        }
                    };
                }
            });
        });


        // Load the main application module
        beforeEach(module(ApplicationConfiguration.applicationModuleName, function ($translateProvider) {
            $translateProvider.translations('en', {});
        }));

        // Store references to $rootScope and $compile
        // so they are available to all tests in this describe block
        beforeEach(inject(function (_$compile_, _$rootScope_, _$state_, _$templateCache_, _$window_,_$httpBackend_,_$document_,_$timeout_) {
            // The injector unwraps the underscores (_) from around the parameter names when matching
            $compile = _$compile_;
            $rootScope = _$rootScope_;
            $state = _$state_;
            scope = _$rootScope_.$new();
            $httpBackend = _$httpBackend_;
            $timeout = _$timeout_;
            $document = _$document_;
            $window =_$window_;
            scope.scenario={
                friendlyId : '1.2.3'
            };
            $httpBackend.expect('GET','/sim5config/options/role/'+role).respond(configData);

            element = angular.element('<div sim5-launch friendly-id="scenario.friendlyId"></div>');
            element = $compile(element)(scope);
            scope.$apply();

            $controller = element.controller('sim5Launch');
            scope = element.isolateScope();
            $document.find('body').append(element);
            $httpBackend.flush();
            $timeout.flush();
        }));

        it('should check scope variables', function () {
            expect(scope.sim5config).toEqualData(configData);
            expect(scope.selectedConfig).toEqualData(scope.sim5config[0])

        });

        it('should launch simulation url in new window on click if there is a single option', function(){
            spyOn($window, 'open');
            element.click();
            $timeout.flush();
            expect($window.open).toHaveBeenCalled();

        });

        it('should check scope variables', function () {
            expect(scope.sim5config).toEqualData(configData);
            expect(scope.selectedConfig).toEqualData(scope.sim5config[0])

        });

        it('should call onConfigSelect if more than one option is present to launch simulation', inject(function (_$compile_){
            spyOn($window, 'open');
            $httpBackend.expect('GET','/sim5config/options/role/'+role).respond(configData2);
            element = angular.element('<div sim5-launch friendly-id="scenario.friendlyId"></div>');
            element = $compile(element)(scope);
            scope.$apply();
            scope = element.isolateScope();
            $httpBackend.flush();
            scope.selectedConfig = configData2[2];

            expect(scope.sim5config).toEqualData(configData2);

            scope.onConfigSelect();
            expect($window.open).toHaveBeenCalled();
        }));




    });
});


