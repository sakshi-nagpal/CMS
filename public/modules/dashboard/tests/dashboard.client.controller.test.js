'use strict';

define(['dashboardModule', 'angularMocks'], function(app) {
	describe('dashboardController', function() {
		//Initialize global variables
		var scope,
			dashboardController,
			$httpBackend,
			$compile,
			$templateCache,
			template,
			$timeout;

		// Create sample article using the Articles service
		var sampleCatalog = [{
				title: 'Office Version 1',
					series: [{
					'title': 'Dummy series',
					'thumbnail':'test.png'
				}]
			},
			{
				title: 'Office Version 2',
				series: [{
					'title': 'Dummy series',
					'thumbnail':'test.png'
				},
					{
						'title': 'Dummy series',
						'thumbnail':'test.png'
					}]
			}];

		var sampleProduct = [{
			title: 'Word',
			thumbnail: 'Word.png'
		}];

		// The $resource service augments the response object with methods for updating and deleting the resource.
		// If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
		// the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
		// When the toEqualData matcher compares two objects, it takes only object properties into
		// account and ignores methods.
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

		beforeEach(inject(function($controller, $rootScope, _$httpBackend_, _$templateCache_, _$compile_, _$timeout_) {

			$timeout =_$timeout_;
			$httpBackend = _$httpBackend_;
			$httpBackend
				.whenGET('catalog')
				.respond (sampleCatalog);
			$httpBackend
				.whenGET('product')
				.respond (sampleProduct);
			scope = $rootScope.$new();

			scope.dummyVar = 'jasdnjkasdnkasdklsamdksa';

			$templateCache = _$templateCache_;
			$compile = _$compile_;
			template = $($compile($templateCache.get('dashboard.client.view.html'))(scope));

			dashboardController = $controller('DashboardController', {
				$scope: scope,
				$element :template
			});
			$httpBackend.flush();
		}));

		it('$scope.find() should return an arrayof versions object fetched from XHR',function() {

			// Test scope value
			expect(scope.catalogs).toEqualData(sampleCatalog);
			expect(scope.selectedCatalog).toEqualData(sampleCatalog[0]);

		});

		it('$scope.selectedCatalogs change should change the DOM',function() {

			scope.selectedCatalog = sampleCatalog[1];
			$timeout.flush();
			expect(template.find('#series-carousel [ng-repeat]').length).toEqualData(2); 

		});

		afterEach(function() {
			$httpBackend.verifyNoOutstandingExpectation();
			$httpBackend.verifyNoOutstandingRequest();
		});

	});
});
