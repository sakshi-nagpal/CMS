'use strict';
define ([

], function() {

	return ['AuthenticationController', ['$scope', '$http', '$location', 'Authentication', '$element', '$timeout',
		function ($scope, $http, $location, Authentication, $element,$timeout) {
			var $username = $element.find('input.username');
			var $password = $element.find('input.password');
			$scope.$emit('hideLoader');
			// Set autocomplete off for IE 10 [Issue : BALOO-165]

			if (navigator.appVersion.indexOf('MSIE 10') !== -1) {
				$scope.autocomplete = 'off';
			}


			// check if the input has any value
			$scope.checkUsername = function () {

				if ($username.val())
					$username.addClass('used');
				else
					$username.removeClass('used');
			};

			// check if the input has any value
			$scope.checkPassword = function () {

				if ($password.val())
					$password.addClass('used');
				else
					$password.removeClass('used');
			};

			// If user is signed in then redirect back home
			if ($scope.authentication.user && $location.path() === '/user/signin')
				$location.path('/').replace();

			$timeout(function () {
				$element.find('.selectpicker').selectpicker();
			});

			$scope.data = {roles:[]};
			$scope.signin = function () {

				$http.post('/auth/signin', $scope.credentials).success(function (response) {
					// If successful we assign the response to the global user model
					$element.hide();
					$scope.authentication.user = response;

					// And redirect to the index page

					$location.path($scope.previousURL).replace();

				}).error(function (response) {
					$scope.error = response.message;
				});

			};

			$scope.setRoles = function() {
				$http.get('/users/roles').success(function(roles) {
					$scope.data.roles = roles;
					$timeout(function(){
						$element.find('.selectpicker').selectpicker('refresh');
					});

				}).error(function() {
					$scope.error = 'unable to set roles';
				});
			};

			$scope.signup = function () {

				$scope.credentials.roles = new Array($scope.credentials.roles);
				$http.post('/auth/signup', $scope.credentials).success(function (response) {
					// If successful we assign the response to the global user model
					//$scope.authentication.user = response;

					$scope.credentials = null;
					$scope.success = 'User created successfully';
					$scope.error = null;
					//$location.path($scope.previousURL).replace();
				}).error(function (response) {
					$scope.error = response.message;
					$scope.success = null;
				});
			};
			$scope.changeUserPassword = function () {
				$scope.success = $scope.error = null;

				$http.post('/users/password', $scope.passwordDetails).success(function (response) {
					// If successful show success message and clear form
					$scope.success = true;
					$scope.error = null;
					$scope.passwordDetails = null;
					//$location.path($scope.previousURL).replace();
				}).error(function (response) {
					$scope.error = response.message;
					$scope.success = true;
				});
			};
			// For IE 10  [Issue : BALOO-201]

			$scope.addUsedClass = function (event) {
				$(event.currentTarget).siblings('input').addClass('used').focus();
			};
			$scope.removeUsedClass = function (event) {
				if (event.currentTarget.value === '') {
					$(event.currentTarget).removeClass('used');
				}
			};
		}

	]];
});
