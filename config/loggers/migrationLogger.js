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
var migrationStream = 'migration.log'; // application logger file name

var migrationLogger = {

    /* library dependent functions */
    init: function(externalConfigDir) {
        logger = new (winston.Logger)({
            transports: [
                new (winston.transports.File)({
                    name: 'migration-log',
                    filename: externalConfigDir ? externalConfigDir +'/logs/'+ migrationStream : migrationStream,
                    maxsize: 5000000,         // in bytes, to rotate file
                    level: 'info',
                    json: false,              // disable json format
                    handleExceptions: false,   // log uncaughtException events
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
        return this.log('debug',msg);
    },
    info: function(msg){
        return this.log('info',msg);
    },
    warn: function(msg){
        return this.log('warn',msg);
    },
    error: function(msg){
        return this.log('error',msg);
    }
};

/**
 * Module init function.
 */
module.exports = migrationLogger;
