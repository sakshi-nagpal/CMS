'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    _ = require('lodash'),
    errorHandler = require('./errors.server.controller'),
    ObjectId = mongoose.Types.ObjectId,
    LibraryStep = mongoose.model('LibraryStep'),
    Scenario = mongoose.model('Scenario'),
    Promise = require('promise'),
    User = mongoose.model('User'),
    historyApi = require('../modules/history.api.server.module');


exports.createLibraryStep = function(req, res, next) {
    var stepName = req.body.stepName,
        stepData = req.body.stepData,
        user = req.user,
        step = {},
        promisesArr = [],
        historyType;

    function saveLibraryStep(sourceStep){
        var libraryStepObj = new LibraryStep({
            name: stepName,
            createdBy : user,
            updatedBy : user,
            skills : sourceStep.skills,
            product : stepData.product,
            app : stepData.skills.app,
            text: sourceStep.text,
            methods:sourceStep.methods
        });
        return libraryStepObj.save();
    }

    if(stepData.sourceType && !stepData.sourceStepId){
        throw new errorHandler.error.MalformedRequest('Invalid stepId. Copy is not possible.');
    }

    if(stepData.sourceType === 'TASK' && stepData.sourceStepId){
        historyType = historyApi.UPDATE_TYPE_CONSTANTS.LIBRARY_STEP_CREATE_EXPORT;
        promisesArr.push(Scenario.findOne({'steps._id':stepData.sourceStepId}, {'steps.$' : 1}).exec().then(function(step) {
            for(var i=0;i<step.steps[0].methods.length;i++){
                step.steps[0].methods[i]= _.omit(step.steps[0].methods[i], 'status'); // omit method status as they are not applicable for library
            }
            return step.steps[0];
        }));
    }
    else if(stepData.sourceType === 'LIBRARY' && stepData.sourceStepId){

        historyType = historyApi.UPDATE_TYPE_CONSTANTS.LIBRARY_STEP_CREATE_COPY;
        promisesArr.push(LibraryStep.findOne({'_id':stepData.sourceStepId}).exec().then(function(step) {
            return step;
        }));
    }
    else{
        historyType = historyApi.UPDATE_TYPE_CONSTANTS.BLANK_LIBRARY_STEP_CREATE;
        promisesArr.push(new Promise(function(resolve,reject){
                step.skills = [];
                step.skills.push(stepData.skills);
                resolve(step);
            })
        );
    }
    Promise.all(promisesArr).then(function(data) {
        saveLibraryStep(data[0]).then(function(libraryStep) {
            return historyApi.pushLibraryStepToHistory(libraryStep._id, req.user,historyType)
        }).then(function(libraryStep) {
            res.send(libraryStep);
        }, function(err) {
            if(err.errors.name.message === 'unique') {
                next(new errorHandler.error.MalformedRequest('Library Step Name must be unique.'));
            }
            else{
                next(new errorHandler.error.ProcessingError(errorHandler.getErrorMessage(err)));
            }
        });
    });

};

exports.getLibraryStepById = function(req, res, next) {
    var step =  req.libraryStep;
    res.send(step);
};

exports.getLibraryStepsBySkillId = function(req, res, next) {
    var skillId = req.params.skillId;
    LibraryStep.find({'skills.skillId' : skillId},{'methods.actions': 0}).sort('createdTimestamp').exec().then(function(steps) {
        res.send(steps);
    }, function(err) {
        next(new errorHandler.error.ProcessingError(errorHandler.getErrorMessage(err)));
    });
};

exports.updateLibraryStep = function(req, res, next) {

    var updatedData,
        autoSave = req.body.autoSave;

    delete req.body.autoSave;
    delete req.body.__v;
    _.assign(req.libraryStep, req.body);

    req.libraryStep.save().then(function(data){
        updatedData = data;
        if(!autoSave ) {
            return historyApi.pushLibraryStepToHistory(req.libraryStep._id, req.user, historyApi.UPDATE_TYPE_CONSTANTS.LIBRARY_STEP_UPDATE);
        }
        return Promise.resolve();
    }).then(function () {
        res.json(updatedData);
    }).then(null, function (err) {
        console.info(err);
        var newErr = new errorHandler.error.ProcessingError(errorHandler.getErrorMessage(err));
        next(newErr);
    });


    /*var step =  req.libraryStep;
     var updatedData;
     step.update(req.body).exec().then(function(data){
     updatedData = data;
     if(!req.body.autoSave ) {
     return historyApi.pushLibraryStepToHistory(step._id, req.user, historyApi.UPDATE_TYPE_CONSTANTS.LIBRARY_STEP_UPDATE);
     }
     return Promise.resolve();
     }).then(function () {
     res.json(updatedData);
     }).then(null, function (err) {
     var newErr = new errorHandler.error.MalformedRequest(errorHandler.getErrorMessage(err));
     next(newErr);
     });*/
};

exports.updateSkillsForLibraryStep = function(req, res, next) {
    var step =  req.libraryStep;
    step.update(req.body).exec().then(function ( step) {
        res.json(step);
    }).then(null, function (err) {
        var newErr = new errorHandler.error.ProcessingError(errorHandler.getErrorMessage(err));
        next(newErr);
    });
};



exports.deleteLibraryStep = function(req, res, next) {
    var step =  req.libraryStep;
    step.remove().then(function (data) {
        return historyApi.deleteLibraryStepFromHistory(step._id, req.user)
    }).then(function(){
        res.json({stepDeleted :true});
    }, function (err) {
        var newErr = new errorHandler.error.ProcessingError(errorHandler.getErrorMessage(err));
        next(newErr);
    });
};

exports.getMappedStepDetails = function(req, res, next) {
    var taskArr = [];
    var promisesArr = [];
    var step = req.libraryStep;
    for(var i = 0; i < step.mappedSteps.length; i++) {
        promisesArr.push(getMappedTasks(step.mappedSteps[i]).then(function(data) {
            taskArr.push(data);
        }));
    }
    Promise.all(promisesArr).then(function() {
        res.json(taskArr);
    });

};

function getMappedTasks(mappedTask) {
    var index = -1;
    return Scenario.findOne({_id: mappedTask.scenarioId}, {friendlyId: 1, steps: 1}).exec().then(function (result) {
        for(var j= 0; j < result.steps.length; j++) {
            if(index < 0 && (result.steps[j]._id.toString() == mappedTask.stepId.toString())) {
                index = j;
            }
        }

        if(index >=0) {
            return {friendlyId: result.friendlyId, stepNum: index + 1};
        }

    }, function (err) {
        throw err;
    });
}

exports.libraryStepById = function (req, res, next) {
    var stepId = req.param('libraryStepId').toString();
    LibraryStep.findOne({_id: stepId}).populate('createdBy').populate('updatedBy').exec().then(function(step) { // get only one element .find() returns array
        if (!step) {
            throw new errorHandler.error.NotFound('step not found');
        }
        req.libraryStep = step;
        next();
    }).then(null,function(err){
        next(err);
    });
};
exports.addMappedStepDetails = function(req, res, next) {
    var taskId = req.body.taskId,
        stepId = req.body.newStepId,
        step = req.libraryStep;

    if(!taskId || !stepId || !step){
        next(new errorHandler.error.MalformedRequest(errorHandler.getErrorMessage(err)));
    }
    var mappedStep = {
        scenarioId : taskId,
        stepId : stepId
    };
    step.mappedSteps.push(mappedStep);
    step.save().then(function(step){
        res.json(step);
    }).then(null, function(err) {
        next(new errorHandler.error.ProcessingError(errorHandler.getErrorMessage(err)));
    });
};

