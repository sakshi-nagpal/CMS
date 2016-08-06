'use strict';

/**
 * Module dependencies.
 */

var morgan = require('morgan');
var config = require('../config');
var fs = require('fs');


var FileStreamRotator = require('file-stream-rotator');

// ensure log directory exists
//fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)

/**
 * Module init function.
 */
module.exports = {

	getLogFormat: function() {
		return config.log.format;
	},

	getLogOptions: function(externalConfigDir) {
		var options = {};

		try {
			if ('stream' in config.log.options) {
				var accessLogStream = FileStreamRotator.getStream({
					filename: externalConfigDir + '/logs/access-%DATE%.log',
					frequency: 'daily',
					verbose: false,
					date_format: 'YYYY-MM-DD'
				});

				options = {
					stream: accessLogStream
				};
			}
		} catch (e) {
			options = {};
		}

		return options;
	}

};
