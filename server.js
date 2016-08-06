'use strict';
/**
 * Module dependencies.
 */

var init = require('./config/init')(),
	config = require('./config/config');

console.log(config);

if(config.appdynamics.enable === true) {
	require('appdynamics').profile({
		controllerHostName: config.appdynamics.controllerHostName, // 'pearson_nonprod.saas.appdynamics.com',
		controllerPort: 443, // If SSL, be sure to enable the next line
		accountName: config.appdynamics.accountName, // Required for a controller running in multi-tenant mode 'pearson_nonprod'
		accountAccessKey: config.appdynamics.accountAccessKey , // Required for a controller running in multi-tenant mode 'f69d8d55048a'
		applicationName: config.appdynamics.applicationName,
		tierName: config.appdynamics.tierName,
		nodeName: config.appdynamics.nodeName, // Node names must be unique. A unique name has been generated for you.
		controllerSslEnabled: true, // Optional - use if connecting to controller via SSL
		proxyAutolaunchDisabled: 1,
		proxyCtrlDir: config.appdynamics.proxyCtrlDir
	});
}
var mongoose = require('mongoose'),
	chalk = require('chalk');

/**
 * Main application entry file.
 * Please note that the order of loading is important.
	 */

// Bootstrap db connection
var db = mongoose.connect(config.port	, config.dbOptions, function(err) {
	if (err) {
		console.error(chalk.red('Could not connect to MongoDB!'));
		console.log(chalk.red(err));
	}
});
mongoose.connection.on('error', function(err) {
		console.error(chalk.red('MongoDB connection error: ' + err));
		process.exit(-1);
	}
);

// Init the express application
var app = require('./config/express')(db);

// Bootstrap passport config
require('./config/passport')();

// Start the app by listening on <port>
app.listen(config.port);

// Expose app
exports = module.exports = app;

// Logging initialization
console.log('--');
console.log(chalk.green(config.app.title + ' application started'));
console.log(chalk.green('Environment:\t\t\t' + process.env.NODE_ENV));
console.log(chalk.green('Port:\t\t\t\t' + config.port));
console.log(chalk.green('Database:\t\t\t' + config.dbUri));
if (process.env.NODE_ENV === 'secure') {
	console.log(chalk.green('HTTPs:\t\t\t\ton'));
}
console.log('--');
