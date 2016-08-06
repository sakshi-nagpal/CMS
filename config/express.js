'use strict';

/**
 * Module dependencies.
 */
var fs = require('fs'),
	http = require('http'),
	https = require('https'),
	express = require('express'),
	morgan = require('morgan'),
	accessLogger = require('./loggers/accessLogger'),
	appLogger = require('./loggers/appLogger'),
	bodyParser = require('body-parser'),
	session = require('express-session'),
	methodOverride = require('method-override'),
	cookieParser = require('cookie-parser'),
	helmet = require('helmet'),
	passport = require('passport'),
	mongoStore = require('connect-mongo')({
		session: session
	}),
	flash = require('connect-flash'),
	config = require('./config'),
	consolidate = require('consolidate'),
	path = require('path'),
	gitRevision = require('git-rev'),
	errorHandler = require('../app/controllers/errors.server.controller'),
	packageJson = require('../package');
	//transactionManager = require('../app/managers/transaction-manager');

module.exports = function(db) {
	// Initialize express app
	var app = express();
	// Globbing model files
	config.getGlobbedFiles('./app/models/**/*.js').forEach(function(modelPath) {
		require(path.resolve(modelPath));
	});
	// Setting application local variables
	app.locals.title = config.app.title;
	app.locals.description = config.app.description;
	app.locals.keywords = config.app.keywords;
	app.locals.jsFiles = config.getJavaScriptAssets();
	app.locals.cssFiles = config.getCSSAssets();
	app.locals.theme = config.theme;
	app.locals.version = packageJson.version;
	gitRevision.short(function (str) {
		app.locals.cacheBuster  = str;
	});
	/*// Passing the request url to environment locals
	app.use(function(req, res, next) {
		res.locals.url = req.protocol + '://' + req.headers.host + req.url;
		next();
	});*/

	// Showing stack errors
	app.set('showStackError', true);

	// Set swig as the template engine
	app.engine('server.view.html', consolidate[config.templateEngine]);

	// Set views path and view engine
	app.set('view engine', 'server.view.html');
	app.set('views', './app/views');

	var externalLogDir = config.getUserHome() +'/.baloo';

	// Enable logger (access & application)
	appLogger.init(externalLogDir); // initial application logger
	appLogger.info('test app log');
	// Environment dependent middleware
	/* istanbul ignore next */
	if (process.env.NODE_ENV === 'development') {

		// Disable views cache
		app.set('view cache', false);

		// Rewrite url
		app.use(function(req, res, next) {
			req.url = req.url.replace(/v=([0-9,a-z,A-Z]+)\//, '');
			next();
		});

	} else if (process.env.NODE_ENV === 'production') {
		app.locals.cache = 'memory';
	}
	// Request body parsing middleware should be above methodOverride
	app.use(bodyParser.urlencoded({
		extended: true
	}));
	app.use(bodyParser.json());
	app.use(methodOverride());

	// Use helmet to secure Express headers
	app.use(helmet.xframe());
	app.use(helmet.xssFilter());
	app.use(helmet.nosniff());
	app.use(helmet.ienoopen());
	app.disable('x-powered-by');
	// Setting the app router and static folder
	app.use(express.static(path.resolve('./public')));

	app.use(function(req, res, next) {
		res.setHeader('Cache-Control', 'max-age=0');
		return next();
	});
	// CookieParser should be above session
	app.use(cookieParser());

	// Express MongoDB session storage
	app.use(session({
		saveUninitialized: true,
		resave: true,
		secret: config.sessionSecret,
		store: new mongoStore({
			mongooseConnection: db.connection,
			collection: config.sessionCollection
		}),
		cookie: config.sessionCookie,
		name: config.sessionName
	}));

	// use passport session
	app.use(passport.initialize());
	app.use(passport.session());
	app.enable('trust proxy');
	morgan.token('user', function getUser(req){
		if(req.user)
			return req.user.username;
	});
	app.use(morgan(accessLogger.getLogFormat(), accessLogger.getLogOptions(externalLogDir)));
	// connect flash for flash messages
	app.use(flash());
	// Authenticate user
	require('../app/routes/app.server.routes')(app);
	// Globbing routing files
	config.getGlobbedFiles('./app/routes/modules/**/*.js').forEach(function(routePath) {
		require(path.resolve(routePath))(app);
	});

	// Assume 'not found' in the error msgs is a 404. this is somewhat silly, but valid, you can do whatever you like, set properties, use instanceof etc.
	app.use(function(err, req, res, next) {
		// If the error object doesn't exists

		var msg,statusCode,stack;
		if (!err) {
			//transactionManager.cleanUp();
			return next();
		}
		else if(err.name && errorHandler.error[err.name] && err instanceof errorHandler.error[err.name]){
			//transactionManager.rollback();
			var name = err.name;

			statusCode = errorHandler.statusCode[name];
			msg = err.message;
			stack = err.stack;

		} else{
			//transactionManager.rollback();
			msg = errorHandler.getErrorMessage(err) + ' ' + err.message;
			stack = err.stack;
			statusCode = 500;
		}

		res.status(statusCode).send({
			message: msg
		});

		if(statusCode == 500){
			appLogger.error(msg + ' ' + stack);
		}
	});

	// Assume 404 since no middleware responded
	app.use(function(req, res) {
		res.status(404).render('404', {
			error: 'Not Found'
		});
	});

	if (process.env.NODE_ENV === 'secure') {
		// Load SSL key and certificate
		var privateKey = fs.readFileSync('./config/sslcerts/key.pem', 'utf8');
		var certificate = fs.readFileSync('./config/sslcerts/cert.pem', 'utf8');

		// Create HTTPS Server
		var httpsServer = https.createServer({
			key: privateKey,
			cert: certificate
		}, app);

		// Return HTTPS server instance
		return httpsServer;
	}

	// Return Express server instance
	return app;
};
