'use strict';

/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    Revision = mongoose.model('Revision'),
    History = mongoose.model('History'),
    _ = require('lodash'),
    historyApi = require('../modules/history.api.server.module');

/*
 Get History of the Entity
 * */
exports.getEntityHistory = function(req,res,next){
    historyApi.getEntityHistory(req.params.id).then(function(data){
        res.send(data);
    },function(err){
        next(new errorHandler.error.ProcessingError(errorHandler.getErrorMessage(err)));
    });
};


/*
 Get Full Revisions for the set of HistoryIds of an Entity
 * */
exports.getEntityRevisions = function(req,res,next){
    var revisionScopeMapArray=[],revisionIds=[], scopeArray=[], result=[];
    var history, baseRevision, olderRevision;

    if(!(Array.isArray(req.query.historyIds)))  //scenario version viewer
        req.query.historyIds = [req.query.historyIds];

    History.find({entityId:req.params.entityId}).sort({version : -1}).exec().then(function(histories){
        for(var i in req.query.historyIds){ // for each history id in the request
            scopeArray=[]; //has version and revision in decreasing order

            for(var j=0;j<histories.length;j++){
                var historyCursor = histories[j];
                if(req.query.historyIds[i]===historyCursor.id.toString()){
                    history= historyCursor;
                }

                if(history && history.version >= historyCursor.version){  //by now we have a history & are browsing versions below it to get full revision
                    if(!_.find(scopeArray,{scope:historyCursor.updateType.scope})){
                        scopeArray.push({scope:historyCursor.updateType.scope, version:historyCursor.version, revisionId:historyCursor.revisionId});
                        if(revisionIds.indexOf(historyCursor.revisionId)<0){
                            revisionIds.push(historyCursor.revisionId); // to fetch revisionRecords for compilation
                        }
                        if(Object.keys(historyApi.REVISION_SCOPE_CONSTANTS.SCENARIO).length === scopeArray.length){
                            break; //if all scope covered, done!
                        }
                    }
                }
            }// per history id, contains set of all scopes of revision
            revisionScopeMapArray.push({historyId:req.query.historyIds[i],scopeArray:scopeArray});
            /* eg. revisionScopeMapArray can be like [{ historyId:"", scopeArray:[{scope:"',version:1,revisionId:""}] }] */
        }

        //get all referred revisions
        Revision.find({_id:{ $in : revisionIds}}).then(function(revisions){
            revisions.forEach(function(ele){
                if(ele.revision.phase){
                    var currentPhase = _.find(req.app.get('phases'), {'code': ele.revision.phase.code});
                    ele.revision.phase.name = currentPhase.name;
                }
            });
            for(var i in revisionScopeMapArray){
                baseRevision=_.find(revisions,{_id:revisionScopeMapArray[i].scopeArray[0].revisionId});
                if(revisionScopeMapArray[i].scopeArray.length > 1){
                    for(var j=0;j<revisionScopeMapArray[i].scopeArray.length;j++){
                        olderRevision = _.find(revisions,{_id:revisionScopeMapArray[i].scopeArray[j].revisionId});
                        for(var key in olderRevision.revision){
                             if(!baseRevision.revision[key])baseRevision.revision[key] = olderRevision.revision[key];
                        }
                    }
                }
                result.push(baseRevision);
            }
            res.json(result);
        });

    },function(err){
        next(new errorHandler.error.ProcessingError(errorHandler.getErrorMessage(err)));
    });
};

