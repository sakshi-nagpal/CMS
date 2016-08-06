'use strict';

define(['userModule' , 'angularMocks'], function(app) {

	// Authentication controller Spec
	describe('AuthenticationController', function() {
		// Initialize global variables
		var AuthenticationController,
			scope,
			template,
			$compile,
			$templateCache,
			$httpBackend,
			$stateParams,
			$location,
			navigator,
			$window,
			window,
			$timeout;





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

		// The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
		// This allows us to inject a service but then attach it to a variable
		// with the same name as the service.
		beforeEach(inject(function($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_, _$timeout_, _$templateCache_, _$compile_, _$window_) {
			// Set a new global scope
			scope = $rootScope.$new();

			// Point global variables to injected services
			$stateParams = _$stateParams_;
			$httpBackend = _$httpBackend_;
			$location = _$location_;
			$timeout = _$timeout_;
			$templateCache = _$templateCache_;
			$compile = _$compile_;
			$window = _$window_;

			navigator = $window.navigator;
			template = $($compile($templateCache.get('signin.client.view.html'))(scope));

			$window.user = null;
			// Initialize the Authentication controller
			AuthenticationController = $controller('AuthenticationController', {
				$scope: scope  ,
                $element : template
			});
		}));

		it('$scope.signin() should login with a correct user and password', function() {

			// Test expected GET request
			$httpBackend.when('POST', '/auth/signin').respond(200, {'username':'Fred','roles':['test']});

			scope.signin();
			$httpBackend.flush();

			// Test scope value
			expect(scope.authentication.user.username).toEqual('Fred');
			expect($location.url()).toEqual('/');
		});

		it('$scope.signin() should fail to log in with blank or wrong credentials', function() {

			//Test expected POST request
			$httpBackend.expectPOST('/auth/signin').respond(400, {
				'message': 'missing or wrong credentials'
			});

			scope.signin();
			$httpBackend.flush();

			// Test scope value
			expect(scope.error).toEqual('missing or wrong credentials');
			expect($location.url()).toEqual('/user/signin');
		});

		it('$scope.signup should signup with correct username and password',function(){

			scope.credentials={roles : 'user'};

			$httpBackend.when('POST','/auth/signup').respond(200, {
				'credentials' :{ 'username' : 'Fred', 'password': 'test', 'roles': ['user']
				}
			});

			scope.signup();
			$httpBackend.flush();

			expect(scope.credentials).toEqual(null);
			//expect(scope.success).toEqual('User created successfully');
		});

		it('$scope.signup should fail to signup with blank username/password',function(){

			scope.credentials={roles : 'user'};

			$httpBackend.expectPOST('/auth/signup').respond(400, {
				'message': 'incorrect credentials'
			});

			scope.signup();
			$httpBackend.flush();

			//expect(scope.credentials).toEqual(null);
			expect(scope.error).toEqual('incorrect credentials');
			expect(scope.success).toEqual(null);

		});

		it('$scope.changeUserPassword should change the password with correct password details',function(){

			$httpBackend.when('POST','/users/password').respond(200, {});

			scope.changeUserPassword();
			$httpBackend.flush();


			expect(scope.error).toEqual(null);
			expect(scope.success).toBeTruthy();
			expect(scope.passwordDetails).toEqual(null);
		});

		it('$scope.changeUserPassword should fail to change the password with incorrect password details',function(){

			scope.success = null;
			scope.error = null;

			$httpBackend.expectPOST('/users/password').respond(400, {
				'message': 'Incorrect Password Details'
			});

			scope.changeUserPassword();
			$httpBackend.flush();

			//expect(scope.credentials).toEqual(null);
			expect(scope.error).toEqual('Incorrect Password Details');
			//expect(scope.success).toEqual(null);
		});

		it('should add class "used" if $username.val() is not null ', function() {

			var $username = template.find('input.username');
			$username.val('testUsername');
			scope.checkUsername();

			expect($username.hasClass('used')).toBeTruthy();
		});

		it('should remove class "used" if $username.val() is null ', function() {

			var $username = template.find('input.username');
			$username.val('');
			scope.checkUsername();

			expect($username.hasClass('used')).toBeFalsy();
		});

		it('should add class "used" if $password.val() is not null ', function() {
			var $password = template.find('input.password');
			$password.val('testPassword');
			scope.checkPassword();

			expect($password.hasClass('used')).toBeTruthy();
		});


		it('should remove class "used" if $password.val() is null', function() {
			var $password = template.find('input.password');
			$password.val('');
			scope.checkPassword();

			expect($password.hasClass('used')).toBeFalsy();
		});


		it('should apply selectpicker plugin', function() {
			$timeout.flush();
			template.find('.selectpicker').selectpicker();
		});

		it('should add class "used" on click in label ', function() {

			var event= {
				'currentTarget' : template.find('.username-label')
				};
			scope.addUsedClass(event);

			expect($(event.currentTarget).siblings('input').hasClass('used')).toBeTruthy();
			expect($(event.currentTarget).siblings('input:focus')).toBeTruthy();

		});


		it('should remove class "used" on blur in label ', function() {

			var event= {
				'currentTarget' : template.find('.username')
			};
			$(event.currentTarget).value = '';
			scope.removeUsedClass(event);

			expect($(event.currentTarget).hasClass('used')).toBeFalsy();

		});
	});
});
