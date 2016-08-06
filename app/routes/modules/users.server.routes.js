'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport');
var user = require('../../controllers/users/users.authorization.server.controller');

module.exports = function(app) {
	// User Routes
	var users = require('../../controllers/users.server.controller.js');

	// Setting up the users authentication api
	app.route('/auth/signin').post(users.signin);
	app.route('/auth/signout').get(users.signout);
	app.route('/auth/signup').post(user.can('administration'), users.signup);

	//roles available for a user
	app.route('/users/roles').get(users.roles);

	//Change the user password
	app.route('/users/password').post(users.changePassword);

	//User role
	app.route('/user/roles').post(users.getRoleDesc);
};
