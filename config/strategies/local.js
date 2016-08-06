'use strict';

/**
 * Module dependencies.
 */
var passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	User = require('mongoose').model('User');

module.exports = function() {

	// Use local strategy
	passport.use(new LocalStrategy({
			usernameField: 'username',
			passwordField: 'password'
		},
		function(username, password, done) {

			//username = username.toLowerCase();
			User.findOne({username: new RegExp('^'+username+ '$','i')}).exec()
				.then(function(user) {

					if (!user) {
						return done(null, false, {
							message: 'The username / password you entered is incorrect'
						});
					}

					if (!user.authenticate(password)) {
						return done(null, false, {
							message: 'The username / password you entered is incorrect'
						});
					}

					return done(null, user);

				}, function(err) {
					done(err);
			});
		}
	));


	/*// Use local strategy
	passport.use(new LocalStrategy({
			usernameField: 'username',
			passwordField: 'password'
		},
		function(username, password, done) {
			User.findOne({
				username: username
			}, function(err, user) {
				if (err) {
					return done(err);
				}
				if (!user) {
					return done(null, false, {
						message: 'Unknown user or invalid password'
					});
				}
				if (!user.authenticate(password)) {
					return done(null, false, {
						message: 'Unknown user or invalid password'
					});
				}

				return done(null, user);
			});
		}
	));*/
};
