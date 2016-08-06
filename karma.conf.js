'use strict';

/**
 * Module dependencies.
 */
var applicationConfiguration = require('./config/config');

// Karma configuration
module.exports = function(config) {
	config.set({
		// Frameworks to use
		frameworks: ['jasmine', 'requirejs'],

		// List of files / patterns to load in the browser

		files: [
			'karma.globals.js',
			{pattern: 'public/modules/**/*.js', included: false},
			{pattern: 'public/lib/**/*.js', included: false},
			{pattern: 'public/config.js', included: false},
			{pattern: 'public/templates.js', included: false},
			{pattern: 'public/routes.js', included: false},
			{pattern: 'public/lib.js', included: false},
			{pattern: 'public/constants.js', included: false},
			{pattern: 'public/testData/*.js', included: false},
			// needs to be last http://karma-runner.github.io/0.12/plus/requirejs.html
			'public/requireConfig.js'
		],

		// Test results reporter to use
		// Possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
        reporters: [ 'dots', 'junit', 'coverage'],


        junitReporter: {
			outputFile: 'test-results.xml',
			suite: ''
		},

        preprocessors : {
            'public/modules/**/!(tests|utils)/*.js': 'coverage'
        },

        coverageReporter : {
            reporters:[{
                type : 'lcov',
                dir : 'coverage_report/front_end'

            },{
                type : 'cobertura',
                dir : 'coverage_report/front_end'
            }]
        },

        // Web server port
		port: 9876,

		// Enable / disable colors in the output (reporters and logs)
		colors: true,

		// Level of logging
		// Possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
		logLevel: config.LOG_INFO,

		// Enable / disable watching file and executing tests whenever any file changes
		autoWatch: true,

		// Start these browsers, currently available:
		// - Chrome
		// - ChromeCanary
		// - Firefox
		// - Opera
		// - Safari (only Mac)
		// - PhantomJS
		// - IE (only Windows)
		browsers: ['PhantomJS'],

		// If browser does not capture in given timeout [ms], kill it
		captureTimeout: 60000,
		browserNoActivityTimeout: 100000,

		// Continuous Integration mode
		// If true, it capture browsers, run tests and exit
		singleRun: true
	});
};
