'use strict';

/**
 * Module Dependencies
 */
var winston = require('winston'), // a multi-transport async logging library for node.js
    config = require('../config');

/**
 * WINSTON LOG LEVELS
 * 'silly', 'debug', 'verbose', 'info', 'warn', 'error'
 * We've exposed the global ones: 'debug', 'info', 'warn', 'error'
 */
var logger = null;
var appStream = 'app.log'; // application logger file name

var appLogger = {

    /* library dependent functions */
    init: function(externalConfigDir){

        logger = new (winston.Logger)({
            transports: [
                new (winston.transports.DailyRotateFile)({
                    name: 'app-log',
                    filename: externalConfigDir ? externalConfigDir +'/logs/'+appStream : appStream,
                    datePattern: '.yyyy-MM-dd',
                    timestamp: function() {return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') },
                    maxsize: 5000000,         // in bytes, to rotate file
                    level: config.logLevel || 'info',
                    json: false,              // disable json format
                    handleExceptions: true,   // log uncaughtException events
                    humanReadableUnhandledException: true,
                    tailable: true            // the larger the appended number, the older the log file.
                })
            ],
            exitOnError: false
        });
    },
    log: function(level,msg){
        if(!logger){ this.init();}
        return logger.log(level,msg);
    },

    /* library independent functions */
    debug: function(msg){
        if(!logger){ this.init();}
        return this.log('debug',msg);
    },
    info: function(msg){
        if(!logger){ this.init();}
        return this.log('info',msg);
    },
    warn: function(msg){
        if(!logger){ this.init();}
        return this.log('warn',msg);
    },
    error: function(msg){
        if(!logger){ this.init();}
        return this.log('error',msg);
    }
};

/**
 * Module init function.
 */
module.exports = appLogger;
