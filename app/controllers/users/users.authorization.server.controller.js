'use strict';
var mongoose = require('mongoose'),
    capability = mongoose.model('capability'),
    promise = require('promise'),
    _ = require('lodash');
/**
 * Gets the capabilities collection data from db
 *
 * @param callback
 */
var capabilities = function (callback) {
    capability.find({}).exec(function (err, data) {
        callback(data);
    });
};


/**
 * Middleware to check the authorization of the currently logged in user
 *
 * @param capability
 * @returns {Function}
 */
var can = function (capability) {
    return function (req, res, next) {
        var capabilities = req.app.get('capabilities');
        if (_.intersection(req.user.roles, capabilities[capability]).length) {
            return next();
        }
        else {
            return res.status(403).send({
                message: 'User is not authorized'
            });
        }
    };
};

var canUpload = function () {
    return function (req, res, next) {
        var capability = req.category.capability;
        var capabilities = req.app.get('capabilities');
        if (_.intersection(req.user.roles, capabilities[capability]).length) {
            return next();
        }
        else {
            return res.status(403).send({
                message: 'User is not authorized'
            });
        }
    };
};

module.exports = {
    capabilities: capabilities,
    can: can,
    canUpload: canUpload
}



