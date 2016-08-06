'use strict';

/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    Scenario = mongoose.model('Scenario'),
    MethodTypeEnum = mongoose.model('methodTypeEnum'),
    Task = mongoose.model('Task'),
    Series = mongoose.model('Series'),
    DocumentCategory = mongoose.model('DocumentCategory'),
    ScenarioTypeEnum = mongoose.model('scenarioTypeEnum'),
    content = require('./content.server.controller'),
    ScenarioPhaseEnum = mongoose.model('scenarioPhaseEnum'),
    ObjectId = mongoose.Types.ObjectId,
    _ = require('lodash'),
    Promise = require('promise'),
    scenarioApi = require('../modules/scenario.api.server.module'),
    contentApi = require('../modules/content.api.server.module'),
    historyApi = require('../modules/history.api.server.module'),
    documentApi = require('../modules/document.api.server.module'),
    LibraryStep = mongoose.model('LibraryStep');

/**
 * Scenario FriendlyId Validation
 */

var isScenarioFriendlyIdValid  = function(friendlyId){
    var scenarioType = friendlyId.slice(friendlyId.lastIndexOf('.')+1);
    var taskFriendlyId = friendlyId.slice(0, friendlyId.lastIndexOf('.'));
    var taskId;
    return content.isTaskFriendlyIdValid(taskFriendlyId).then(function(data){
            taskId = data.taskId;
            return data.seriesId;
        })
        .then(function(data){
            return content.isScenarioTypeValid(data,scenarioType).then(function(data){
                return taskId;
            });
        })
        //.then(content.isScenarioTypeValid)
        //.then(function(data){
        //        return taskId;
        //    })
        .then(null,function(err){
            throw new errorHandler.error.NotFound(err);
        });
};

/**
 * Create Scenario Middleware
 */


var createScenario = function(data){

    var task, scenarioType, blankScenarioJson;
    var taskPromise = Task.findById(data.taskId).exec();
    var scenarioTypePromise = ScenarioTypeEnum.findOne({'code': data.friendlyId.slice(data.friendlyId.lastIndexOf('.') + 1)}).exec();

    return Promise.all([taskPromise, scenarioTypePromise]).then(function (result) {

        task = result[0];
        scenarioType = result[1];
        blankScenarioJson = {
            friendlyId : data.friendlyId,
            taskId : data.taskId,
            title : task.title,
            type : scenarioType.toObject(),
            phase : data.phase.toObject(),
            createdBy : {
              _id: data.user._id,
              name: data.user.displayName
            },
            updatedBy : {
                _id: data.user._id,
                name: data.user.displayName
            }
        };

        var scenarioObject = new Scenario(blankScenarioJson);
        return scenarioObject.save().then(function (scenarioObject) {
            return scenarioObject;
        }, function(err) {
            throw err;
        });
    }).then(null,function(err){
        throw err;
    });
};

/**
 * Create Scenario
 */

exports.create = function (req, res, next) {
    var data;
    data = {
        taskId : req.query.taskId,
        friendlyId : req.params.newFriendlyId,
        user : req.user,
        phase : _.find(req.app.get('phases'), {'code': 'AUT'})
    };
    createScenario(data).then(function(data){
        return historyApi.pushScenarioToHistory(data._id,req.user,historyApi.UPDATE_TYPE_CONSTANTS.BLANK_SCENARIO_CREATE,req.app.get('phases'));
    }).then(function(scenario){
        attachScenarioRefMetadata(scenario.toJSON()).then(function(scenario) {
            res.json(scenario);
        }, function(err) {
            throw err;
        });
    },function(err){
        next(err);
    });
};

exports.updateScenario = function(req,res,next) {
    var scenario = req.scenario;
    scenario = _.extend(scenario, req.body);
    scenario.save().then(function () {
        return historyApi.pushScenarioToHistory(scenario._id,req.user,historyApi.UPDATE_TYPE_CONSTANTS.METADATA_UPDATE,req.app.get('phases'));
    }).then(function(scenario){
        res.json(scenario);
    }, function (err) {
        next(new errorHandler.error.ProcessingError(errorHandler.getErrorMessage(err)));
    });
};
/**
 * Create a step
 */

exports.createStep = function (req, res, next) {
    if (!req.scenario) {
        throw new errorHandler.error.MalformedRequest('scenario friendly id is invalid');
    }
    var scenarioObject = req.scenario;
    if (req.sourceScenario) {
        var step = _.find(req.sourceScenario.steps, {_id: ObjectId(req.params.stepId)});  //takes stepId instead of step index
        step.threads = []; //removing comments if any
        scenarioApi.clearMethodStatus(step);
        step.copiedFrom = {
            label: 'task',
            scenarioId: req.scenario._id,
            stepId: step._id
        };
        step._id = mongoose.Types.ObjectId();
        scenarioObject.steps.addToSet(step);
    }
    else {
        scenarioObject.steps.addToSet({});
    }

    scenarioObject.save().then(function () {
        //Step Import
        if(req.sourceScenario){
            return historyApi.pushScenarioToHistory(scenarioObject._id,req.user,historyApi.UPDATE_TYPE_CONSTANTS.STEP_IMPORT,req.app.get('phases'));
        }else{
        //Step Create
            return historyApi.pushScenarioToHistory(scenarioObject._id,req.user,historyApi.UPDATE_TYPE_CONSTANTS.STEP_CREATE,req.app.get('phases'));
        }

    }).then( function() {
        res.json({stepLength: scenarioObject.steps.length});
    },function(err) {
        var newErr = new errorHandler.error.ProcessingError(errorHandler.getErrorMessage(err));
        next(newErr);
    });
};


exports.importLibraryStep = function (req, res, next) {
    if (!req.scenario) {
        throw new errorHandler.error.MalformedRequest('scenario friendly id is invalid');
    }
    var scenarioObject = req.scenario;
    var stepId = req.params.stepId;
    LibraryStep.findOne({_id: stepId}).exec().then(function (step) {
        var newStep = _.extend({},step.toJSON());
        newStep.copiedFrom = {
            label: 'Library',
            stepId: stepId
        };
        newStep._id = mongoose.Types.ObjectId();
        scenarioObject.steps.addToSet(newStep);
        scenarioObject.save().then(function (data) {
            return historyApi.pushScenarioToHistory(scenarioObject._id, req.user, historyApi.UPDATE_TYPE_CONSTANTS.STEP_IMPORT,req.app.get('phases'));
        }).then(function(){
            res.json({stepLength: scenarioObject.steps.length, _id :newStep._id});
        },function (err) {
            var newErr = new errorHandler.error.ProcessingError(errorHandler.getErrorMessage(err));
            next(newErr);
        });
    });
};

/**
 * List of Scenarios and Step Id

 *//*
 exports.list = function (req, res, next) {
 Scenario.find().sort({'index': 1}).select('-steps.methods').exec(function (scenarios) {
 res.json(scenarios);
 }, function (err) {
 var newErr = new errorHandler.error.MalformedRequest(errorHandler.getErrorMessage(err));
 next(newErr);
 });
 };
 */

exports.getStep = function (req, res) {
    var scenario = req.scenario;
    var step = scenario.steps[req.params.stepIndex];
    res.json(step);
};


exports.getMethodsByStepId = function (req, res, next) {
    var scenario = req.scenario;
    var stepId = req.param('stepId').toString();
    var step = _.find(scenario.steps, {_id: ObjectId(stepId)});
    scenario.steps = null;
    res.json({step: step, scenario: scenario});
};


/* Update a Step

 */

exports.updateStep = function (req, res, next) {
    var scenario = req.scenario;
    var id = req.params.stepId || '';
    var respJson;

    Scenario.update(
        {'friendlyId': scenario.friendlyId, 'steps._id': id},
        {
            '$set': {
                'steps.$': req.body
            }
        }
    ).exec().then(function (doc) {
            respJson = doc;
            if(req.query.isAutoSave === 'false') {
                return historyApi.pushScenarioToHistory(scenario._id, req.user, historyApi.UPDATE_TYPE_CONSTANTS.STEP_CONTENT_UPDATE,req.app.get('phases'));
            }
            return Promise.resolve();
        }).then(function(){
            res.json(respJson);
        }, function (err) {
            var newErr = new errorHandler.error.ProcessingError(errorHandler.getErrorMessage(err));
            next(newErr);
        });
};

/*
 exports.copySteps = function (req, res, next) {

 var sourceScenarioType = req.query.scenarioType;

 if (sourceScenarioType === null) {
 throw new errorHandler.error.MalformedRequest('Scenario type not provided.');
 }

 var scenario = req.scenario;
 var friendlyId = scenario.friendlyId;
 var sourceFriendlyId = friendlyId.substring(0, friendlyId.length - 2) + sourceScenarioType;

 Scenario.findOne({friendlyId: sourceFriendlyId}).exec().then(function (sourceScenario) {
 if (sourceScenario === null) {
 throw new errorHandler.error.MalformedRequest('Source scenario not found with provided scenario type.');
 }
 else {
 scenario.steps = sourceScenario.steps;
 scenario.save().then(function () {
 res.json(scenario);
 }, function (err) {
 throw new errorHandler.error.MalformedRequest(errorHandler.getErrorMessage(err));
 });
 }
 }, function (err) {
 throw new errorHandler.error.MalformedRequest(errorHandler.getErrorMessage(err));
 }
 ).then(null, function (err) {
 next(err);
 });
 };
 */
function attachScenarioRefMetadata(scenario) {
    return contentApi.projectByTaskId(scenario.taskId, {requiredScenarioRef: true}).then(function(project) {
        scenario.content_ref = _.find(project.data.content_ref, {'type': scenario.type.code});
        return scenario;
    }, function (err) {
        throw err;
    });
}

exports.getScenario = function (req, res) {

    if(req.scenario.friendlyId) {
        var scenario = req.scenario.toJSON();
        attachScenarioRefMetadata(scenario).then(function(scenario) {
            res.json(scenario);
        }, function(err) {
            throw err;
        });
    }
    else {
        res.json(req.scenario);
    }
};

/**
 * Delete a Step
 */


exports.deleteStep = function (req, res, next) {

    var scenario = req.scenario;
    var steps = scenario.steps.id(req.params.stepId).remove();
    scenario.save().then(function() {
        return LibraryStep.update({'mappedSteps.stepId':req.params.stepId}, {
            $pull: {
                'mappedSteps' : {stepId : req.params.stepId}
            }
        }).exec();
    }).then(function () {
        return historyApi.pushScenarioToHistory(scenario._id,req.user,historyApi.UPDATE_TYPE_CONSTANTS.STEP_DELETE,req.app.get('phases'));
    }).then(function(scenario){
        res.json(scenario);
    },function (err) {
        var newErr = new errorHandler.error.ProcessingError(errorHandler.getErrorMessage(err));
        next(newErr);
    });
};

function getScenarioByIdQuery(req, id) {
    var ScenarioByfriendlyIdQuery;
    ScenarioByfriendlyIdQuery = Scenario.findOne({'friendlyId': id.toUpperCase()}).populate('documents.category').populate('documents.file');
    if (req.query.includeActions === 'false') {
        ScenarioByfriendlyIdQuery = ScenarioByfriendlyIdQuery.select('-steps.methods.actions');
    }  else {
        //ScenarioByfriendlyIdQuery = Scenario.findOne({'friendlyId': id.toUpperCase()}).select('documents.category');
        //remove action ids as these are not requried on the frontend and causes issues.
     //   ScenarioByfriendlyIdQuery = ScenarioByfriendlyIdQuery.select('-steps.methods.actions._id');
    }

    if (req.query.getTaskData === 'true') {
        ScenarioByfriendlyIdQuery.populate('taskId', 'app');
    }

    return ScenarioByfriendlyIdQuery;
}

/**
 * Scenario by friendlyId
 */
exports.ScenarioByfriendlyId = function (req, res, next, id, property) {
    var ScenarioByfriendlyIdQuery = getScenarioByIdQuery(req, id);
    ScenarioByfriendlyIdQuery.exec().then(function (scenario) {
        /* param can be sourceFriendlyId or friendlyId */
        if (property === 'sourceFriendlyId') {
            req.sourceScenario = scenario;
            next();
        }
        else if (scenario) {
            req.scenario = scenario;
            next();
        }
        else {
            return isScenarioFriendlyIdValid(req.params.friendlyId).then(function (data) {
                req.scenario = {taskId: data};
                next();
            });
        }
    }).then(null, function (err) {
        next(new errorHandler.error.NotFound(err.message));
    });
};

exports.getScenarioObjectId = function (req, res, next) {


    var friendlyId = req.query.searchText;


    var ScenarioByfriendlyIdQuery = getScenarioByIdQuery(req, friendlyId);

    ScenarioByfriendlyIdQuery.exec().then(function (scenario) {
        req.scenario = scenario;
        if (req.scenario !== null) {
            res.send({exists: true, taskId: req.scenario.taskId, friendlyId: req.scenario.friendlyId});
        } else {
            res.send({exists: false});
        }
    }).then(null, function (err) {
        var newErr = new errorHandler.error.ProcessingError(errorHandler.getErrorMessage(err));
        next(newErr);
    });
};


exports.updateSkillsForStep = function (req, res, next) {

    var scenarioId = req.params.id || '';
    if (!ObjectId.isValid(scenarioId)) {
        throw new errorHandler.error.MalformedRequest('Scenario id is invalid');
    }

    var stepId = req.params.stepId || '';
    Scenario.update(
        {'_id': scenarioId, 'steps._id': stepId},
        {
            '$set': {
                'steps.$.skills': req.body.skills
            }
        }
    ).exec().then(function (doc) {
/*
            historyApi.pushScenarioToHistory(scenarioId,req.user,historyApi.UPDATE_TYPE_CONSTANTS.TAG_SKILL,req.app.get('phases'));
*/
            res.json(doc);
        }).then(null, function (err) {
            var newErr = new errorHandler.error.ProcessingError(errorHandler.getErrorMessage(err));
            next(newErr);
        });
};

exports.getScenarioMethodTypes = function (req, res, next) {
    MethodTypeEnum.find({}).exec().then(function (data) {
        res.send(data);
    }, function (err) {
        var newErr = new errorHandler.error.ProcessingError(errorHandler.getErrorMessage(err));
        next(newErr);
    });
};


exports.copyScenario = function (req, res, next) {
    var scenario, sourceScenario;
    if (!req.scenario || !req.sourceScenario) {
        throw new errorHandler.error.MalformedRequest('scenario friendly id is invalid');
    }
    else if (req.scenario && !req.scenario.friendlyId) {
        var data;
        data = {
            taskId: req.scenario.taskId,
            friendlyId: req.params.friendlyId,
            user: req.user,
            phase: _.find(req.app.get('phases'), {'code': 'AUT'})
        };
        createScenario(data).then(function(data){
            return copyStepsAndDocuments(data,req.sourceScenario, req.query.includeAttachments).then(function(data){ // data can hold old docs
                return historyApi.pushScenarioToHistory(data._id,req.user,historyApi.UPDATE_TYPE_CONSTANTS.SCENARIO_CREATE_COPY,req.app.get('phases'));
            }).then(function(scenario){
                res.json(scenario);
            },function(err){
                throw err;
            });
        }).then(null,function(err){
            next(err);
        });
    }
    else{
        copyStepsAndDocuments(req.scenario,req.sourceScenario, req.query.includeAttachments).then(function(data){
           return historyApi.pushScenarioToHistory(data._id,req.user,historyApi.UPDATE_TYPE_CONSTANTS.SCENARIO_COPY,req.app.get('phases'));
       }).then(function(scenario){
            res.json(scenario);
        },function(err){
           next(err);
       });
    }
};

    /*var newSteps = req.sourceScenario.steps.toObject();
    //deleteNestedArrayObjectIds(newSteps);
    scenario.steps = newSteps;*/            //document if steps-methods-actions are required to copied with new _ids

    function copyStepsAndDocuments(scenario, sourceScenario, includeAttachments){
        scenario.steps = sourceScenario.steps;
        scenario.threads = [];     //Remove comments from target scenario
        scenarioApi.clearMethodStatus(scenario);

        scenario.steps.forEach(function(step) {
            step.threads = [];      // Remove comments from the steps being copied from source scenario
        });

        if (includeAttachments === 'true') {
            return documentApi.copyScenarioDocuments(scenario, sourceScenario).then(function () {        //scenario documents are copied
               return scenario;
            }, function (err) {
                throw err;
            });
        } else {
            return scenario.save().then(function () {
                return scenario;
            }, function (err) {
                throw err;
            });
        }
};

/*
 deletes objectIds: _id's in a deeply nested document recursively
 */

var deleteNestedArrayObjectIds = function (array) {
    for (var i = 0; i < array.length; i++) {

        delete array[i]._id;

        for (var prop in array[i]) {
            if (Array.isArray(array[i][prop])) {
                deleteNestedArrayObjectIds(array[i][prop]);
            }
        }
    }
};


exports.getSiblings = function (req, res, next) {
    var key;
    if (!req.scenario) {
        throw new errorHandler.error.MalformedRequest('scenario friendly id is invalid');
    }
    var findQuery = {'taskId': req.scenario.taskId};
    if (req.query.hasSteps === 'true') { // bring sibling that has steps
        findQuery.$where = 'this.steps.length > 0';
    }

    key = 'phase.code';
    if (req.query.isEditable === 'true') {
        findQuery[key] = {$in: [_.find(req.app.get('phases'), {'editable': true}).code]};
    }

    Scenario.find(findQuery).select('friendlyId type -_id').sort('type.index').exec().then(function (siblings) {
        res.json(siblings);
    }, function (err) {
        throw new errorHandler.error.ProcessingError(errorHandler.getErrorMessage(err));
    });
};

/*
 Get Scenarios By Friendly Id
 */
exports.getScenariosByTaskId = function (req, res, next) {
    var taskId = req.params.taskId;
    var query = {'taskId': taskId};
    if (req.query.hasSteps === 'true') { // bring scenarios that has steps
        query.$where = 'this.steps.length > 0';
    }
    Scenario.find(query).select('friendlyId type -_id').sort('type.index').exec().then(function (scenarios) {
        res.json(scenarios);
    }, function (err) {
        next(new errorHandler.error.ProcessingError(errorHandler.getErrorMessage(err)));
    });
};

/**
 * Get list of Scenarios Phase types
 */

exports.scenarioPhaseTypes = function (callback) {
    ScenarioPhaseEnum.find({}).exec(function (err, data) {
        callback(data);
    });
};

/**
 * Check if Scenario Phase is editable
 */
exports.isScenarioPhaseEditable = function(req, res, next) {
    if (_.find(req.app.get('phases'), {'code': req.scenario.phase.code}).editable) {
        next();
    }
    else {
        return res.status(403).send({
            message: 'User is not authorized'
        });
    }
};


/**
 * Change scenario phase if user is authorized and scenario is validated successfully
 */
var changeScenarioPhase = function(req, res) {
    req.scenario.phase = _.find(req.app.get('phases'), {'code': req.params.phaseCode}).toObject();
    req.scenario.save().then(function (scenario) {
        return historyApi.pushScenarioToHistory(scenario._id,req.user,historyApi.UPDATE_TYPE_CONSTANTS.PHASE_CHANGE,req.app.get('phases'));
    }).then(function(){
        res.json(true);
    }, function (err) {
        //next(new errorHandler.error.MalformedRequest(errorHandler.getErrorMessage(err)));
        throw err;
    }).then(null, function(err) {
        throw err;
    });
};

exports.changePhase = function (req, res, next) {
    var scenario = req.scenario;
    var currentPhase = _.find(req.app.get('phases'), {'code': req.scenario.phase.code});
    if(_.intersection(req.user.roles, currentPhase.usersRoles).length) {        //user is authorized
        var changePhase = false;
        if(!currentPhase.editable) {                                            //current phase is not editable
            changeScenarioPhase(req, res);
        } else {
            scenarioApi.validateScenario(scenario).then(function(errorsJson) {
                if(!Object.keys(errorsJson).length) {
                    changeScenarioPhase(req, res);
                } else res.send(errorsJson);
            }, function(err) {
                throw err;
            }).then(null, function(err) {
                next(err);
            });
        }

    } else {
        next(new errorHandler.error.ForbiddenAccess(errorHandler.getErrorMessage('user is not authorized')));
    }
};

exports.checkIfScenarioExists = function(req, res, next){
    var scenarioIds = req.query.inputJson.split(',');
    if(typeof scenarioIds === 'string' ) {
        scenarioIds = [scenarioIds];
    }
    scenarioIds.forEach(function(scenarioId, index){
        scenarioIds[index] = scenarioId.trim();
    });

    return Scenario.find({'friendlyId' :{ '$in' : scenarioIds} }).exec().then(function(data){
        if(data.length != scenarioIds.length){
            throw new errorHandler.error.NotFound('Invalid Scenario Id ');
        }
    }).then(function(){
        res.send({exists:true});
    },function(err){
        next(new errorHandler.error.NotFound(errorHandler.getErrorMessage(err)));
    });
};

exports.changeScenarioStatus = function(req, res, next) {
    var status = req.params.isActive === 'true';

    req.scenario.isActive = status;
    req.scenario.save().then(function () {
        res.send({status: status});
    }, function (err) {
        next(new errorHandler.error.ProcessingError(errorHandler.getErrorMessage(err)));
    });
};
