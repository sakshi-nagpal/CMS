'use strict';

/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    Scenario = mongoose.model('Scenario'),
    _ = require('lodash'),
    historyApi = require('../modules/history.api.server.module'),
    Promise = require('promise'),
    ObjectId = mongoose.Types.ObjectId;

exports.reorderSteps = function (req, res, next) {

    var scenario = req.scenario;
    var step = scenario.steps.id(req.params.stepId).remove();
    scenario.steps.splice(req.params.stepIndex, 0, step);
    scenario.save().then(function(){
        return historyApi.pushScenarioToHistory(scenario._id,req.user,historyApi.UPDATE_TYPE_CONSTANTS.STEP_REORDER,req.app.get('phases'));
    }).then(function(scenario){
        res.json(scenario);
    },function(err){
        var newErr = new errorHandler.error.ProcessingError(errorHandler.getErrorMessage(err));
        next(newErr);
    });
};


exports.getStepIndex = function(req, res, next){

    var index = -1;
    var stepId= req.param('stepId').toString();
    _.each(req.scenario.steps, function(data, idx) {
        if (_.isEqual(data._id.toString(),stepId)) {
            index = idx;
            return;
        }
    });
    if(index < 0){
        throw new errorHandler.error.NotFound(err);
    } else {
        res.json({index:index});
    }
};

/**
 * mark method unsupported, supported or default
 * @param req
 * @param res
 * @param next
 */
exports.changeMethodStatus = function(req, res, next){
    for(var i =0;i<req.scenario.steps.length;i++){
        var step = req.scenario.steps[i];
       var method =  _.find(step.methods, {'id': req.params.methodId});
        if(method) break;
    }

    method.status = req.params.methodStatus;
    req.scenario.save().then(function () {
        res.json(true);
    }, function (err) {
        next(new errorHandler.error.ProcessingError(errorHandler.getErrorMessage(err)));
    });
};

function _updateAllMethodsStatus (scenarios, methodCount) {
    var promiseArray = [];
    scenarios.forEach(function(scenario) {
        scenario.steps.forEach(function(step) {
            step.methods.forEach(function(method, i) {
                i < methodCount ? method.status = 'supported' : method.status = 'unsupported';
            });
        });
        promiseArray.push(scenario.save());
    });

    Promise.all(promiseArray).then(function() {
       return;
    }, function(err) {
        throw err;
    });
}

exports.updateMethodsInScenarios = function(req, res, next) {
    var friendlyIds = req.query.friendlyIds;
    var methodCount = req.query.count;

    if(!friendlyIds || !methodCount || isNaN(methodCount))  {
        throw (new errorHandler.error.ProcessingError('Invalid query parameters'));
    }
    friendlyIds = friendlyIds.replace(/\s/g, '').toUpperCase().split(',');

    Scenario.find({friendlyId: {$in: friendlyIds}}).exec()
        .then(function(scenarios) {
            if(scenarios && scenarios.length !== friendlyIds.length) {
                next(new errorHandler.error.NotFound('Invalid friendlyId'));
            }
            return _updateAllMethodsStatus(scenarios, methodCount);
        })
        .then(function() {
            res.send('Scenarios are successfully updated!');
        }, function(err) {
            next(new errorHandler.error.ProcessingError(errorHandler.getErrorMessage(err)));
        });
};

