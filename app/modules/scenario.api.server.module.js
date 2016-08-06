'use strict';

var Promise = require('promise'),
    mongoose = require('mongoose'),
    errorHandler = require('../controllers/errors.server.controller'),
    contentApi = require('../modules/content.api.server.module'),
    Task = mongoose.model('Task'),
    Series = mongoose.model('Series'),
    DocumentCategory = mongoose.model('DocumentCategory'),
    _ = require('lodash'),
    ObjectId = mongoose.Types.ObjectId;

var validateScenarioSteps = function (scenario) {
    var errorsJson = {};

    if (scenario.steps && scenario.steps.length) {                   //check if steps exists
        var stepsErrorJson = {};
        scenario.steps.forEach(function (step, i) {
            i += 1;
            var tmpJson = {};
            if (!step.text || !(step.text.replace(/^((&nbsp;)|\s)*|((&nbsp;)|\s)*$/g,'')).length) tmpJson.blankStep = true;    //check for step text

            if (step.methods && step.methods.length) {                                          //check if methods exist
                var tmpArr = [];
                step.methods.forEach(function (method, j) {
                    j += 1;
                    if(method.actions && method.actions.length) {           //check if actions exists
                        method.actions.forEach(function (action) {
                            if ((!action.text || !(action.text.replace(/^((&nbsp;)|\s)*|((&nbsp;)|\s)*$/g,'')).length) && (tmpArr.indexOf(j) === -1)) tmpArr.push(j);    //check for action test
                        });
                    }
                });
                if(tmpArr.length) tmpJson.blankAction = tmpArr;
            } else tmpJson.noMethod = true;
            if(Object.keys(tmpJson).length) stepsErrorJson[i] = tmpJson;
        });
        if(Object.keys(stepsErrorJson).length) errorsJson.steps = stepsErrorJson;

    } else errorsJson.task = {noSteps : true};
    return errorsJson;
};

var validateScenarioDocuments = function (scenario) {
    var error = {};
    var options = {requiredDocs : true};
    return contentApi.seriesByElementId(scenario.taskId, options).then(function(series) {
        var list = [];
        _.find(series.data.documentCategories, {type : 'scenario'}).categories.forEach(function(document) {
            if(!scenario.documents || !scenario.documents.length)
                error[document.displayName] = true;
            else {
                var hasRequiredDoc = false;
                scenario.documents.forEach(function(obj) {
                    if(obj.category._id.equals(document._id)) hasRequiredDoc = true;
                });
                if(!hasRequiredDoc) error[document.displayName] = true;
            }
        });
        return error;
    }, function(err) {
        throw err;
    });
};

exports.validateScenario = function(scenario) {
    var errorsJson= validateScenarioSteps(scenario);
    return validateScenarioDocuments(scenario).then(function(error) {
        if(Object.keys(error).length) errorsJson.requiredDocuments = (error);
        return errorsJson;
    }, function(err) {
        throw err;
    });
};

exports.clearMethodStatus = function(entity){
    if(entity.steps){
        var scenario = entity;
        for(var i =0;i<scenario.steps.length;i++){
            var step = scenario.steps[i];
            for(var j=0;j<step.methods.length;j++){
                step.methods[j].status = 'default';
            }
        }
    }
    else if(entity.methods){
        var step = entity;
        for(var j=0;j<step.methods.length;j++){
            step.methods[j].status = 'default';
        }
    }

};



/*
 var validateScenarioSteps = function (scenario) {
 var result = [];
 var blankStep = [];
 var noMethod = [];
 var blankActionList = {};
 var tmpJson = {};
 if (scenario.steps.length) {                   //check if steps exists
 scenario.steps.forEach(function (step, i) {
 i += 1;
 if (!step.text || !step.text.length) blankStep.push('<b>' + i + '</b>');    //check for step text REMOVE SPACES

 if (step.methods.length) {
 step.methods.forEach(function (method, j) {
 j += 1;
 method.actions.forEach(function (action) {
 if (!action.text.length) {          //check for action text
 if(blankActionList.hasOwnProperty(i)) {
 if(tmpJson[i].indexOf(j) === -1) {
 blankActionList[i] += '<b>, ' + j + '</b>';
 tmpJson[i].push(j);
 }
 }
 else {
 blankActionList[i] = '<b>' + 'Step ' + i + ', ' + 'Method ' + j + '</b>';
 tmpJson[i] = [];
 tmpJson[i].push(j);
 }
 }
 })
 })
 }
 else noMethod.push('<b>' + i + '</b>');
 })
 }
 else result.push({message : messages.noStep});
 if(blankStep.length) result.push({message : messages.blankStep + blankStep.join(', ')});
 if(noMethod.length) result.push({message : messages.noMethod + noMethod.join(', ')});
 if(Object.keys(blankActionList).length) result.push({message : messages.blankAction, list : blankActionList});

 return result;
 };
 */

/*
var ScenarioPhaseTransitionErrorMessages = {
    noStep : 'There are no steps in the task',
    blankStep : 'Step text is blank for <b>step(s): </b>',
    noMethod : 'There are no methods in <b>step(s): </b>',
    blankAction : 'Action text is blank in the following <b>method(s): </b>',
    missingRequiredDocument : 'Following required documents are missing in the scenario: '
};*/
