'use strict';

// Setting up route


angular.module('routes').config(['$stateProvider','Constants',
	function($stateProvider,Constants) {
		// Users state routing
		$stateProvider
			.state(Constants.MODULES.users, {
				url: '/user',
				lazyModule: Constants.MODULES.users,
				lazyTemplateUrl: 'user.client.view.html',
				lazyFiles: 'userModule'
			})
			.state('users.signin', {
				url: '/signin',
				templateUrl: 'signin.client.view.html'
			}).state('users.signup', {
				url: '/signup',
				templateUrl: 'signup.client.view.html'
			}).state('users.password', {
				url: '/password',
				templateUrl: 'change-password.client.view.html'
			});
	}
]);
