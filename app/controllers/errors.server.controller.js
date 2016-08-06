'use strict';


/**
 * Get unique error field name
 */
var getUniqueErrorMessage = function(err) {
	var output;

	try {
		var fieldName = err.err.substring(err.err.lastIndexOf('.$') + 2, err.err.lastIndexOf('_1'));
		output = fieldName.charAt(0).toUpperCase() + fieldName.slice(1) + ' already exists';

	} catch (ex) {
		output = 'Unique field already exists';
	}

	return output;
};



/**
 * status codes
 */

exports.statusCode = {
	'MalformedRequest':400,
	'UnauthorizedAccess':401,
	'ForbiddenAccess':403,
	'NotFound':404,
	'ProcessingError':500
};

exports.error= {};

exports.error.NotFound = function(msg){
	this.name = 'NotFound';
	this.message = msg;
	this.stack = (new Error()).stack;
};
exports.error.NotFound.prototype = new Error;

exports.error.MalformedRequest = function(msg){
	this.name = 'MalformedRequest';
	this.message = msg;
	this.stack = (new Error()).stack;
};
exports.error.MalformedRequest.prototype = new Error;


exports.error.UnauthorizedAccess = function(msg){
	this.name = 'UnauthorizedAccess';
	this.message = msg;
	this.stack = (new Error()).stack;
};
exports.error.UnauthorizedAccess.prototype = new Error;

exports.error.ForbiddenAccess = function(msg){
	this.name = 'ForbiddenAccess';
	this.message = msg;
	this.stack = (new Error()).stack;
};
exports.error.ForbiddenAccess.prototype = new Error;

exports.error.ProcessingError = function(msg){
	this.name = 'ProcessingError';
	this.message = msg;
	this.stack = (new Error()).stack;
};
exports.error.ProcessingError.prototype = new Error;

/**
 * Get the error message from error object
 */
exports.getErrorMessage = function(err) {
	var message = '';

	if (err.code) {
		switch (err.code) {
			case 11000:
			case 11001:
				message = getUniqueErrorMessage(err);
				break;
			default:
				message = 'Something went wrong';
		}
	} else {
		for (var errName in err.errors) {
			if (err.errors[errName].message) message = err.errors[errName].message;
		}
	}

	return message;
};

