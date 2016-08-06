'use strict';

/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
    sim5service = require('../modules/sim5config.server.module'),
    errorHandler = require('./errors.server.controller'),
    SIM5Config = mongoose.model('SIM5Config');

exports.launchSimulation = function(req, res, next){
    var env = req.query.env;
    var friendlyId = req.query.friendlyId;

    if(!env){
        next(new errorHandler.error.MalformedRequest('User role not specified in query params'))
    }

    SIM5Config.findOne({'env':env}).exec().then(function(config){
        return sim5service.launchSimulation(config, friendlyId);
    }).then(function(url){
        res.redirect(url);
    }, function(error){
        next(new errorHandler.error.ProcessingError(error))
    });
};

exports.getConfigForRole = function(req, res, next){
    var role = req.params.role;

    if(!role){
        next(new errorHandler.error.MalformedRequest('User role not specified in query params'))
    }

    SIM5Config.find({'userRoles':role},{'label':1,'type':'1','env':1}).exec().then(function(data){
        res.json(data);
    });

}
