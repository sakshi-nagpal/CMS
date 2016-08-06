'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	errorHandler = require('../errors.server.controller'),
	mongoose = require('mongoose'),
	passport = require('passport'),
	logger = require('../../../config/loggers/appLogger'),
	User = mongoose.model('User'),
	Role = mongoose.model('role'),
	ObjectId = mongoose.Types.ObjectId;

/**
 * Signin after passport authentication
 */
exports.signin = function(req, res, next) {
	logger.debug('signing in');
	passport.authenticate('local', function(err, user, info) {
		if (err || !user) {
			if(info.message === 'Missing credentials') {
				info.message = 'The username / password cannot be left blank';
			}
			var newErr= new errorHandler.error.MalformedRequest(info.message);
			next(newErr);

		} else {
			// Remove sensitive data before login
			user.password = undefined;
			user.salt = undefined;

			req.login(user, function(err) {
				if (err) {
					res.status(400).send(err);

				} else {
					res.json(user);
				}
			});
		}
	})(req, res, next);
};

/**
 * Signout
 */
exports.signout = function(req, res) {
	req.logout();
	res.redirect('/');
};

/**
 * Signup
 */
exports.signup = function(req, res,next) {
	// For security measurement we remove the roles from the req.body object
	//delete req.body.roles;

	// Init Variables
	var user = new User(req.body);
	var message = null;

	// Add missing user fields
	user.provider = 'local';
	user.displayName = user.firstName + ' ' + user.lastName;

	// Then save the user
	user.save().then(function(){
		// Remove sensitive data before replying
		user.password = undefined;
		user.salt = undefined;
		res.json(user);
	}).then(null,function(err){
		var newErr = new errorHandler.error.ProcessingError(errorHandler.getErrorMessage(err));
		next(newErr);
	});
};

/**
 * Change Password
 */
exports.changePassword = function(req, res ,next) {
	// Init Variables
	var passwordDetails = req.body;

	if (passwordDetails.newPassword) {
		User.findById(req.user.id).exec().then(function(user) {
			if (user) {
				if (user.authenticate(passwordDetails.currentPassword)) {
					if (passwordDetails.newPassword === passwordDetails.verifyPassword) {
						user.password = passwordDetails.newPassword;

						user.save(function(err) {
							if (err) {
								var newErr = new errorHandler.error.ProcessingError(errorHandler.getErrorMessage(err));
								next(newErr);
							} else {
								req.login(user, function(err) {
									if (err) {
										throw err;
									} else {
										res.send({
											message: 'Password changed successfully'
										});
									}
								});
							}
						});
					} else {
						throw new errorHandler.error.MalformedRequest('Passwords do not match, please retype.');
					}
				} else {
					throw new errorHandler.error.MalformedRequest('Your current password is incorrect.');
				}
			} else {
				throw new errorHandler.error.MalformedRequest('User is not found');
			}
		}).then(null,function(err){
			next(err);
		});
	} else {
		throw new errorHandler.error.MalformedRequest('Please provide a new password');
	}
};

exports.getRoleDesc = function(req, res,next) {
	var roleName = req.body.roles;
	Role.find({name:{$in : roleName}}).exec().then(function(roleDesc) {
		res.json(roleDesc);
	}, function(err) {
		next(new errorHandler.error.ProcessingError(errorHandler.getErrorMessage(err)));
	});
};

exports.roles = function(req, res, next) {
	Role.aggregate([
		{$group: {_id:'roles', data:{$push: '$name'}}}
	], function(err, roles) {
		res.json(roles[0].data);
	});
};
