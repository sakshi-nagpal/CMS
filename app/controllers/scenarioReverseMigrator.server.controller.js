'use strict';

var scenarioDataReverseMigrator = require('../migrators/scenarioDataReverseMigrator/scenarioDataReverseMigrator'),
    errorHandler = require('./errors.server.controller'),
    _ = require('lodash');

exports.migrate = function(req, res) {
    var balooScenarioFriendlyIdArray = req.param('balooIds').split(','),
        billiScenarioFriendlyIdArray = req.param('billiIds').split(',');

    if(balooScenarioFriendlyIdArray && billiScenarioFriendlyIdArray && balooScenarioFriendlyIdArray.length === billiScenarioFriendlyIdArray.length) {
        scenarioDataReverseMigrator.migrate(billiScenarioFriendlyIdArray, balooScenarioFriendlyIdArray, function(statusCode, json) {
            res.status(statusCode).send(json);
        });
    } else {
        throw new errorHandler.error.MalformedRequest('Please enter equal number of ids in both parameters i.e. balooIds and billiIds');
    }
};

exports.billiToBilliMigrate = function(req, res) {


    var sourceBilliScenarioFriendlyIdArray = req.body.sourceBilliIds.split(','),
        destinationBilliScenarioFriendlyIdArray = req.body.destinationBilliIds.split(',');
    console.log('billiToBilliMigrate Called',sourceBilliScenarioFriendlyIdArray.length);
    console.log('billiToBilliMigrate Called',destinationBilliScenarioFriendlyIdArray.length);

    if(sourceBilliScenarioFriendlyIdArray && destinationBilliScenarioFriendlyIdArray && sourceBilliScenarioFriendlyIdArray.length === destinationBilliScenarioFriendlyIdArray.length) {
        scenarioDataReverseMigrator.billiToBilliMigrate(sourceBilliScenarioFriendlyIdArray, destinationBilliScenarioFriendlyIdArray, function(statusCode, json) {
            res.status(statusCode).send(json);
        });
    } else {
        throw new errorHandler.error.MalformedRequest('Please enter equal number of ids in both parameters i.e. sourceBilliIds and destinationBilliIds');
    }
};

exports.hasAuthorization = function(roles) {
    var _this = this;

    return function(req, res, next) {
        if (_.intersection(req.user.roles, roles).length) {
            return next();
        } else {
            var newErr = new errorHandler.error.ForbiddenAccess('User is not authorized');
            next(newErr);
        }
    };
};
