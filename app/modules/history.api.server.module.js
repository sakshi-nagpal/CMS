'use strict';

/*
* Exposes Update Types for Scenario
* Function pushToHistory needs updated Scenario, User and UpdateTypeName
* Function getScenarioHistory that returns history of the scenario
* */
var mongoose = require('mongoose'),
    History = mongoose.model('History'),
    Revision = mongoose.model('Revision'),
    Scenario = mongoose.model('Scenario'),
    config = require('../../config/config'),
    LibraryStep = mongoose.model('LibraryStep'),
    _ = require('lodash'),
    Promise = require('bluebird');

var REVISION_SCOPE_CONSTANTS = {
    'SCENARIO':{
        'STEP':{name:'step',select:'steps'},
        'DOCUMENT':{name:'document',select:'documents'},
        'METADATA':{name:'metadata',select:'phase levelOfRevision difficulty'},
        'TITLE':{name:'title',select:'title'},
        'FRIENDLY_ID':{name:'friendlyId',select:'friendlyId'},
        'FULL': {name:'full',select:'friendlyId title phase levelOfRevision difficulty steps documents'}
    },
    'LIBRARY_STEP':{
        'FULL':{name:'full',select:'name text methods'}
    }
};
 var UPDATE_TYPE_CONSTANTS = {
     'BLANK_SCENARIO_CREATE' : {name:'Created Scenario',scope:REVISION_SCOPE_CONSTANTS.SCENARIO.FULL},
     'SCENARIO_CREATE_COPY' : {name:'Created Scenario via Copy',scope:REVISION_SCOPE_CONSTANTS.SCENARIO.FULL},
     'SCENARIO_COPY' : {name:'Copied Scenario',scope:REVISION_SCOPE_CONSTANTS.SCENARIO.FULL},
     'STEP_CREATE' : {name:'Added New Step',scope:REVISION_SCOPE_CONSTANTS.SCENARIO.STEP},
     'STEP_CONTENT_UPDATE':{name:'Updated Step Content',scope:REVISION_SCOPE_CONSTANTS.SCENARIO.STEP},
     'STEP_IMPORT' : {name:'Imported Step',scope:REVISION_SCOPE_CONSTANTS.SCENARIO.STEP},
     'STEP_REORDER': {name:'Reordered Step',scope:REVISION_SCOPE_CONSTANTS.SCENARIO.STEP},
     'METADATA_UPDATE' : {name:'Updated Scenario Metadata',scope:REVISION_SCOPE_CONSTANTS.SCENARIO.METADATA},
     'DOCUMENT_DELETE' : {name:'Deleted Document',scope:REVISION_SCOPE_CONSTANTS.SCENARIO.DOCUMENT},
     'DOCUMENT_ADD': {name:'Added Document',scope:REVISION_SCOPE_CONSTANTS.SCENARIO.DOCUMENT},
     'DOCUMENT_UPDATE': {name:'Updated Document',scope:REVISION_SCOPE_CONSTANTS.SCENARIO.DOCUMENT},
     'PHASE_CHANGE': {name:'Changed Phase',scope:REVISION_SCOPE_CONSTANTS.SCENARIO.METADATA},
     'STEP_DELETE': {name:'Deleted Step',scope:REVISION_SCOPE_CONSTANTS.SCENARIO.STEP},
     'COPIED_FROM_BILLI': {name:'Copied From Billi',scope:REVISION_SCOPE_CONSTANTS.SCENARIO.FULL},

     'BLANK_LIBRARY_STEP_CREATE': {name:'Created Blank Library Step', scope:REVISION_SCOPE_CONSTANTS.LIBRARY_STEP.FULL},
     'LIBRARY_STEP_CREATE_COPY': {name:'Copied Library Step', scope:REVISION_SCOPE_CONSTANTS.LIBRARY_STEP.FULL},
     'LIBRARY_STEP_CREATE_EXPORT': {name:'Exported Library Step', scope:REVISION_SCOPE_CONSTANTS.LIBRARY_STEP.FULL},
     'LIBRARY_STEP_UPDATE': {name:'Updated Library Step',scope:REVISION_SCOPE_CONSTANTS.LIBRARY_STEP.FULL},
     'SCENARIO_TITLE_UPDATE' : {name:'Update Scenario Title', scope:REVISION_SCOPE_CONSTANTS.SCENARIO.TITLE},
     'SCENARIO_FRIENDLY_ID_UPDATE' : {name:'Update Scenario Friendly Id', scope:REVISION_SCOPE_CONSTANTS.SCENARIO.FRIENDLY_ID}
/*
     'TAG_SKILL':'Tagged Skill'
*/
};


exports.deleteLibraryStepFromHistory = function(stepId){
    return Revision.find({'revision._id':stepId}).remove().exec().then(function(){
        return History.find({'entityId':stepId}).remove();
    }).then(null, function(err){
        throw err;
    })
};

exports.pushLibraryStepToHistory = function(stepId, user, updateType){
    var libraryStep, libraryStepRevisionDocument;
    return LibraryStep.findByIdAndUpdate(stepId,{
        '$set': {
            'updatedBy': user,
            'updatedTimestamp': Date.now()
        }
    }).exec().then(function(updatedLibraryStep) {
        libraryStep = updatedLibraryStep;
        return LibraryStep.findById(stepId).select(updateType.scope.select).exec();
    },function(err){
        console.log(err);
    }).then(function(revisionData) {
        var libraryStepRevisionObj = {};
        libraryStepRevisionObj.revision = revisionData.toObject();
        return pushToRevisions(libraryStepRevisionObj)
    }).then(function(revision){
        libraryStepRevisionDocument = revision;
        return getLatestVersionHistory(libraryStep._id);
    }).then(function(history) {
        var libraryStepHistoryObj = {
            'entityId':libraryStep._id,
            'revisionId':libraryStepRevisionDocument._id,
            'version':((history && history.version)? history.version : 0)+1,
            'type':'LibraryStep',
            'updateType': {
                'name' : updateType.name,
                'scope': updateType.scope.name
            },
            'updatedBy' : {
                _id: user._id,
                name: user.displayName
            }
        };
        return pushToHistories(libraryStepHistoryObj);
    }).then(function(historyDoc){
        return libraryStep;
    }).then(null,function(err){
        throw err;
    });
};


exports.pushScenarioToHistory = function(scenarioBSONId,user,updateType,phases){
    var scenario,scenarioRevisionDocument;
    return Scenario.findByIdAndUpdate(scenarioBSONId,{
        '$set': {
            'updatedBy._id': user._id,
            'updatedBy.name': user.displayName
        }
    }).exec()
    .then(function(updatedScenario){ scenario = updatedScenario; return Scenario.findById(scenarioBSONId).populate('documents.category').populate('documents.file').select(updateType.scope.select).exec()})
    .then(function(data){
            var scenarioRevisionObj = {};
            scenarioRevisionObj.revision = data.toObject();
            return pushToRevisions(scenarioRevisionObj)
    }).then(function(revision) {
            scenarioRevisionDocument = revision;
            return getLatestVersionHistory(scenario._id);
    }).then(function(history){
            var scenarioHistoryObj = {
                'entityId':scenario._id,
                'revisionId':scenarioRevisionDocument._id,
                'version':((history && history.version)? history.version : 0)+1,
                'phase': scenario.phase.toObject(),
                'type':'Scenario',
                'updateType': {
                    'name': updateType.name,
                    'scope': updateType.scope.name
                },
                'updatedBy' : {
                    _id: user._id,
                    name: user.displayName
                }
            };
            if(updateType.name === UPDATE_TYPE_CONSTANTS.PHASE_CHANGE.name && history && _.find(phases, {'code': history.phase.code}).editable && !(_.find(phases, {'code': scenario.phase.code}).editable )){
                scenarioHistoryObj.publish = true;
            }
            return pushToHistories(scenarioHistoryObj);
    }).then(function(data){
            return scenario;
        },function(err){
            throw err;
    });
};


var getLatestVersionHistory = function(entityId){
    return History.find({'entityId':entityId}).sort({version : -1}).limit(1).exec().then(function(history){
        return history[0];
    });
};

var pushToRevisions = function(entityRevisionObj){
    var entityRevisionDocument = new Revision(entityRevisionObj);
    entityRevisionDocument.typeVersion = config.scenarioRevisionTypeVersion;
    return entityRevisionDocument.save().then(function(revisionDoc){
        return revisionDoc;
    });
};

var pushToHistories = function(entityHistoryObj){
    var entityHistoryDocument = new History(entityHistoryObj);
    return entityHistoryDocument.save().then(function(historyDoc){
        return historyDoc;
    });
};

exports.getEntityHistory = function(entityId){
    return History.find({'entityId':entityId}).sort({'version':-1}).exec();
};

exports.clearEntityHistory = function (entityId) {

    var returnObj = {history:[],revision:[]};
    return new Promise(function(resolve, reject){
        History.find({'entityId': entityId}).exec()
            .then(function (histories) {
                returnObj.history.push(histories);
                History.remove({'entityId': entityId}).then(function(){
                    Revision.find({'revision._id': mongoose.Types.ObjectId(entityId)}).exec().then(function(revisions){
                        returnObj.revision.push(revisions);
                        Revision.remove({'revision._id': mongoose.Types.ObjectId(entityId)}).exec().then(function(revisions){
                            return resolve(returnObj);
                        });
                    });
                });
            }).then(null,function(err){
                return reject(returnObj);
            });
    });

};

exports.UPDATE_TYPE_CONSTANTS = UPDATE_TYPE_CONSTANTS;
exports.REVISION_SCOPE_CONSTANTS = REVISION_SCOPE_CONSTANTS;
