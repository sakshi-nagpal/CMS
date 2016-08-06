'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./../../controllers/errors.server.controller.js'),
    uploadCollectionManager = require('../../util/uploadCollectionManager'),
    historyApi = require('../history.api.server.module'),
    documentApi = require('../document.api.server.module'),
    threadApi = require('../thread.api.server.module'),
    Content = mongoose.model('Content'),
    Scenario = mongoose.model('Scenario'),
    Task = mongoose.model('Task'),
    Thread = mongoose.model('threads'),
    History = mongoose.model('History'),
    Revision = mongoose.model('Revision'),
    ObjectId = mongoose.Types.ObjectId,
    Series = mongoose.model('Series'),
    _ = require('lodash'),
    fs = require('fs'),
    logger = require('../../../config/loggers/appLogger'),
    XLSX = require('xlsx'),
    Promise = require('bluebird');

var seriesObj;
var scenarioIdsArr = [];
var returnObj = {};

var validApps = ['Word 2013','Word 2016','PPT 2013','PPT 2016','Access 2013','Access 2016','Excel 2013','Excel 2016','Windows 10','Office 2013'];

var seriesSheetTemplate =[
    {
        header :'ObjectID'
    },
    {
        header: 'Application'
    },
    {
        type: 'cms_section',
        header : 'Section'
    },
    {
        type: 'cms_chapter',
        header : 'Chapter'
    },
    {
        type: 'cms_project',
        header : 'Project'
    },
    {
        type: 'cms_task',
        header : 'Task'
    },
    {
        header :'TaskID'
    }

];

var columnIndexer = [-1,-1,-1,-1];

var getSeriesById = function(seriesId){
    return Content.findById(seriesId).exec().then(function(data){
        seriesObj = data;
    });
};
var getContentDataForSeries = function(seriesId){
    return Content.find({'path': new RegExp(seriesId+'#')}).exec();
};

var removeContentData = function(series){
    return Content.find({'path': new RegExp(series+'#')}).remove().exec();//.then(function(){Content.collection.dropAllIndexes()});
};

var removeScenarioDocs = function(taskIds){
    return Scenario.find({'taskId': {$in: taskIds} }).remove().exec();
};

var updateScenario = function(id, newObj, oldObj){
    Scenario.update(
        {'_id': id},
        {
            '$set': {
                'friendlyId': newObj.friendlyId || oldObj.friendlyId,
                'title': newObj.title || oldObj.title
            }
        }
    ).exec().then(function(data){

            if(newObj.friendlyId){
                historyApi.pushScenarioToHistory(id,request.user,historyApi.UPDATE_TYPE_CONSTANTS.SCENARIO_FRIENDLY_ID_UPDATE,request.app.get('phases'));
            }

            if(newObj.title){
                historyApi.pushScenarioToHistory(id,request.user,historyApi.UPDATE_TYPE_CONSTANTS.SCENARIO_TITLE_UPDATE,request.app.get('phases'));
            }

            if(data.n == 0){
                logger.error('Error in Scenario Update of '+ id + ' to ' +newObj.friendlyId);
                returnObj.errors.push({error:'Error in Scenario Update of '+ id + ' to ' +newObj.friendlyId});
                return resolve(returnObj);
            }
        });
};


var updateScenarioDocs = function(friendlyId, updates){
    return Scenario.find({'friendlyId': new RegExp(friendlyId)},{friendlyId :1 ,title: 1}).exec().then(function (docs) {
        var newObj = {};
        var oldObj = {};
        for (var i= 0;i <docs.length;i++ ){
            oldObj.friendlyId = docs[i].toJSON().friendlyId;
            oldObj.title = docs[i].toJSON().title;
            if(updates.friendlyId){
                newObj.friendlyId = updates.friendlyId + '.'+ oldObj.friendlyId.split('.').pop();
                newObj.friendlyId = newObj.friendlyId.toUpperCase();
            }
            if(updates.title){
                newObj.title = updates.title;
            }
            scenarioIdsArr[docs[i]._id] = {newObj :newObj, oldObj: oldObj};
            updateScenario(docs[i]._id, newObj, oldObj);
        }
    });
};



var deleteScenarioDocs = function(friendlyId){
     return new Promise(function(resolve, reject){
         var scenarios;
         var deletedObjects = {
             threads: [],
             histories:[],
             revisions:[],
             scenarios:[]
         };
         Scenario.find({'friendlyId': new RegExp(friendlyId)}).exec().then(function (docs) {
             var scenario;
             var promiseArr = [];
             scenarios = docs;
             for (var i= 0;i <docs.length;i++ ){
                 scenario = docs[i];
                 promiseArr.push(threadApi.removeAllThreadsScenario(scenario).then(function(threads){
                     if(threads.length)
                        deletedObjects.threads = deletedObjects.threads.concat(threads);
                 }));
                 promiseArr.push(historyApi.clearEntityHistory(scenario._id).then(function(history){
                     if(history.history.length === 1)
                        deletedObjects.histories = deletedObjects.histories.concat(history.history[0]);
                     else if(history.history.length > 1)
                         deletedObjects.histories = deletedObjects.histories.concat(history.history);
                     if(history.revision.length === 1)
                        deletedObjects.revisions = deletedObjects.revisions.concat(history.revision[0]);
                     else if(history.revision.length > 1)
                         deletedObjects.revisions = deletedObjects.revisions.concat(history.revision);
                 }));
                 promiseArr.push(Scenario.findOneAndRemove({friendlyId:scenario._doc.friendlyId}).exec().then(function(scenario){
                     deletedObjects.scenarios.push(scenario);
                 }));
             }
             return Promise.all(promiseArr);
         }).then(function(data){
             /* remove all documents after all has been successfully deleted */
             var promiseArr = [];
             scenarios.forEach(function(scenario){
                 promiseArr.push(documentApi.removeAllDocumentsForScenario(scenario));
             });
             return Promise.all(promiseArr);
         }, function(err){
             returnObj.errors.push({err:'Error Deleting Scenario: '+err});
             return reinsertDeletedDocuments(deletedObjects);
         }).then(funcation(){
             return resolve();
         }, function(err){
             returnObj.errors.push({err:'Error Deleting Documents: '+err});
             return reinsertDeletedDocuments(deletedObjects);
         }).then(function(){
             return resolve();
         }, function(err){
             returnObj.errors.push({err:'Error reinserting scenario, documents, history, comments: '+err});
             return resolve();
         });
     });
};

var reinsertDeletedDocuments = function(deletedObjects){
    var promiseArr = [];
    deletedObjects.threads.forEach(function(thread){
        if(thread && thread._doc){
            var thread = new Thread(thread.toJSON());
            promiseArr.push(thread.save());
        }

    });
    deletedObjects.histories.forEach(function(history){
        if(history && history._doc){
            var history = new History(history.toJSON());
            promiseArr.push(history.save());
        }

    });
    deletedObjects.revisions.forEach(function(revision){
        if(revision && revision._doc){
            var revision = new Revision(revision.toJSON());
            promiseArr.push(revision.save());
        }
    });
    deletedObjects.scenarios.forEach(function(scenario){
        if(scenario && scenario._doc){
            var scenario = new Scenario(scenario.toJSON())
            promiseArr.push(scenario.save());
        }
    });

    return Promise.all(promiseArr);
}

var restoreScenarioData = function(scenarioIdsArr) {
    var promiseArr = [];
    for (var key in scenarioIdsArr) {
        promiseArr.push(updateScenario(key, scenarioIdsArr[key].oldObj))
    }
    return Promise.all(promiseArr);
};

var getRowLength = function(obj){
    for(var j=6; j>1; j--){
        if(obj[seriesSheetTemplate[j].header]){
            break;
        }
    }
    return j+1;
};

var saveData = function(dataArray){
    var content;
    var dataLength = dataArray.length;
    var savedData = [];
    return new Promise(function(resolve, reject){
        var saveData;
        saveData = function(data, index){
            if(data.data.type == seriesSheetTemplate[2].type){
                data.data.parent = seriesObj;
            } else {
                data.data.parent = savedData[data.parent];
            }
            if(data.data.type == seriesSheetTemplate[5].type){
                content = new Task(data.data);
            } else {
                content = new Content(data.data);
            }
            content.save(function(err, obj){
                if(err){
                    //console.log('error saving data');
                    returnObj.errors.push({error:'Error saving data'});
                    return resolve();
                }
                var title = data.parent + obj._doc.title;
                savedData[title] = obj;
                //console.log('saved: ',index,' length: ',dataLength);
                ++index;
                if(index < dataLength){
                    saveData(dataArray[index],index);
                } else {
                    //console.log('data saved');
                    return resolve();
                }
            })
        };
        saveData(dataArray[0],0);
    });

}

var request;
exports.import = function(seriesId, sheetName, mode, req){
    request = req;
    var seriesDataMapper = {};
    var seriesData = null;
    var parentData = {};
    var mode = mode;
    var rows=[];
    returnObj = {additions:[], updates: [], deletions: [],deletedScenarios:[], errors: [], rows: [], updatedFriendlyIds:[],isCollectionModified:false, updatedScenarios: {}};

    return getSeriesById(seriesId).then(function(){
        return getContentDataForSeries(seriesId);
    }).then(function(data){
        seriesData = data;
        /* create json for series*/
        return new Promise(function(resolve, reject) {
            seriesData.forEach(function(seriesDataObj){
                seriesDataMapper[seriesDataObj._id.toString()] = seriesDataObj;
            });
            resolve(seriesData);
        });
    }).then(function(){
        return new Promise(function(resolve, reject){
            /* read sheet */
            var workbook = XLSX.readFile(sheetName);
            rows = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[workbook.SheetNames[0]]);
            var columnsLength ,
                parentHeader ,
                parent ,
                isTask ,
                doc,
                content = null,
                createdObjectIds = {},
                createdFriendlyIds = {};

            var validateRow = function(index){
                /* reject on id repetition in sheet */
                var objId = rows[index][seriesSheetTemplate[0].header];
                if(createdObjectIds[objId]){
                    returnObj.errors.push({row:(index+2),error:'ObjectId repetition error'});
                }
                if(objId) createdObjectIds[objId] = true;

                doc = seriesDataMapper[objId];

                if(doc) {
                    doc = doc.toJSON();
                } else {
                    doc = {};
                    rows[index][seriesSheetTemplate[0].header] = '';
                }
                parentHeader ='';
                parent = null;
                content = null;
                isTask = false;

                /* set application as blank if not in sheet */
                if(!rows[index][seriesSheetTemplate[1].header])
                    rows[index][seriesSheetTemplate[1].header] = '';

                columnsLength = getRowLength(rows[index]);

                if(!columnsLength || columnsLength < 3 ||
                    ((rows[index][seriesSheetTemplate[5].header] || rows[index][seriesSheetTemplate[6].header]) && columnsLength != 7 )){
                    returnObj.errors.push({row:(index + 2),error:'Data is undefined'});
                }

                (columnsLength === seriesSheetTemplate.length) ? columnIndexer[columnsLength-4]++ : columnIndexer[columnsLength-3]++;

                if(columnsLength === (seriesSheetTemplate.length - 1)){ // friendly id does not exist for cms_task type
                    returnObj.errors.push({row:(index + 2),error:'Friendly ID does not exist'});
                }

                if(columnsLength === seriesSheetTemplate.length) {
                    if(!rows[index][seriesSheetTemplate[5].header]){    // check if task exists if friendly ID is specified
                        returnObj.errors.push({row:(index + 2),error:'Data does not exist'});
                    }
                    columnsLength--;
                    isTask = true;
                }
                if(!rows[index][seriesSheetTemplate[columnsLength-1].header]){
                    returnObj.errors.push({row:(index + 2),error:'Title missing'});
                }
                if(seriesSheetTemplate[columnsLength-1].type != seriesSheetTemplate[2].type){ /* validate parent existence for all, other than section */
                    for(var j=2;j<columnsLength-1;j++){
                        parentHeader += rows[index][seriesSheetTemplate[j].header] ? rows[index][seriesSheetTemplate[j].header].trim() : undefined;
                        parent = parentData[parentHeader];
                        if(parentHeader.length > 0 && !parent){
                            returnObj.errors.push({row:(index + 2),error: 'Parent '+rows[index][seriesSheetTemplate[j].header]+' does not exists'});
                        }
                    }
                }

                /* app should exists for chapters and tasks */
                if((seriesSheetTemplate[columnsLength-1].type === seriesSheetTemplate[3].type || seriesSheetTemplate[columnsLength-1].type === seriesSheetTemplate[5].type)
                && _.intersection([rows[index][seriesSheetTemplate[1].header]],validApps).length == 0){
                    // app is mandatory for chapter and task types
                    returnObj.errors.push({row:(index + 2),error: 'Application does not exist or invalid'});
                }

                if(isTask && createdFriendlyIds[rows[index][seriesSheetTemplate[columnsLength].header]]){
                        returnObj.errors.push({row:(index + 2),error:'FriendlyId Repetition Error'});
                } else {
                    createdFriendlyIds[rows[index][seriesSheetTemplate[columnsLength].header]] = true;
                }

                if(doc._id){
                    doc.documentVersion++;
                    if(doc.type !== seriesSheetTemplate[columnsLength-1].type){
                        returnObj.errors.push({row:(index + 2),error:'Type do not match. Expected: '+ doc.type+ ' got: '+ seriesSheetTemplate[columnsLength-1].type});
                    }
                    if(doc.title != rows[index][seriesSheetTemplate[columnsLength-1].header]){
                        returnObj.updates.push({row:(index + 2),field:'Title', oldValue: doc.title, newValue: rows[index][seriesSheetTemplate[columnsLength-1].header]});
                        if(isTask){
                            /* updated scenarios correspond to Ids */
                            if(!returnObj.updatedScenarios[doc.data.friendlyId])
                                returnObj.updatedScenarios[doc.data.friendlyId] = {};
                            returnObj.updatedScenarios[doc.data.friendlyId].title = rows[index][seriesSheetTemplate[columnsLength-1].header];
                        }
                    }
                    if(doc.app && (doc.app !== rows[index][seriesSheetTemplate[1].header])){
                        returnObj.updates.push({row:(index + 2),field:'App', oldValue: doc.app, newValue: rows[index][seriesSheetTemplate[1].header]});
                    }
                    if(isTask && doc.data.friendlyId != rows[index][seriesSheetTemplate[columnsLength].header]){
                        returnObj.updates.push({row: (index + 2),field:'Task ID',oldValue: doc.data.friendlyId, newValue: rows[index][seriesSheetTemplate[columnsLength].header]});
                        returnObj.updatedFriendlyIds.push({oldId:doc.data.friendlyId, newId: rows[index][seriesSheetTemplate[columnsLength].header]});
                        if(!returnObj.updatedScenarios[doc.data.friendlyId])
                            returnObj.updatedScenarios[doc.data.friendlyId] = {};
                        returnObj.updatedScenarios[doc.data.friendlyId].friendlyId = rows[index][seriesSheetTemplate[columnsLength].header];
                        doc.data.friendlyId = rows[index][seriesSheetTemplate[columnsLength].header].toUpperCase();
                    }
                    // reordered
                    /*if(doc.serialNumber && doc.serialNumber != index){
                        logger.error('Order updated at index '+(index+2));
                        returnObj.updates.push('Order updated at index '+(index+2));
                    }*/
                } else {
                    if(isTask)
                        doc.data = {};
                    rows[index].isNew = true;
                    returnObj.additions.push({row:(index + 2), title:rows[index][seriesSheetTemplate[columnsLength-1].header]});
                }

                doc.type = seriesSheetTemplate[columnsLength-1].type;
                doc.title = rows[index][seriesSheetTemplate[columnsLength-1].header]? rows[index][seriesSheetTemplate[columnsLength-1].header].trim():'';
                doc.app = rows[index][seriesSheetTemplate[1].header];
                doc.updatedTimestamp = Date.now();
                doc.serialNumber = index;
                doc.path = null;
                if(isTask){
                    doc.data.friendlyId = rows[index][seriesSheetTemplate[columnsLength].header] ? rows[index][seriesSheetTemplate[columnsLength].header].toUpperCase() :'';
                }

                parentData[parentHeader+doc.title] = rows[index];
                returnObj.rows.push({data:doc, parent: parentHeader});

                if(objId) delete seriesDataMapper[objId];
                if(rows.length === index+1){
                    for(var key in seriesDataMapper){
                        returnObj.deletions.push({id:key, title: seriesDataMapper[key].title, type:seriesDataMapper[key].type});
                        if(seriesDataMapper[key].toJSON().type === 'cms_task'){
                            returnObj.deletedScenarios.push({id:seriesDataMapper[key].toJSON().data.friendlyId});
                        }
                    }
                    return resolve(returnObj);
                } else {
                    validateRow(++index);
                }

            };

            validateRow(0);
        })

    }).then(function(data){
        /* create dummy collection */
        return new Promise(function(resolve, reject){
            if(mode === 'dryrun'){
                return reject('dryrun case');
            }

            if(returnObj.errors.length){
                return reject('error case');
            }

            if(seriesData.length === 0){
                return resolve(returnObj);
             }
             uploadCollectionManager.createCollection(seriesData,'ContentBackup', {
                 success: function(seriesData){
                    returnObj.isCollectionModified = true;
                    return removeContentData(seriesId).then(resolve);
             },
             error:function(err){
                 logger.error('Error creating dummy collection', err);
                 returnObj.push({error:'Critical!! Error creating dummy collection: '+err});
                 return resolve(returnObj);
             }
             });
        });

    }).then(function(data){
        return saveData(returnObj.rows);
    }).then(function(data){
        if(Object.keys(returnObj.updatedScenarios).length == 0 && returnObj.deletedScenarios.length == 0){
            return data;
        } else {
            var promiseArray =[];

            if(Object.keys(returnObj.updatedScenarios).length){
                /* update scenarios */
                for(var key in returnObj.updatedScenarios){
                    promiseArray.push(updateScenarioDocs(key, returnObj.updatedScenarios[key]));
                }
            }
            if(returnObj.deletedScenarios.length){
                returnObj.deletedScenarios.forEach(function(scenario){
                    promiseArray.push(deleteScenarioDocs(scenario.id));
                });
            }
            return Promise.all(promiseArray);
        }

    }).then(function(data){
        var promiseArr = [];

        if(!returnObj.errors.length) {
            promiseArr.push(new Promise(function (resolve, reject) {
                return resolve(data);
            }));
        } else if(returnObj.isCollectionModified){
            promiseArr.push(removeContentData(seriesId).then(function () {
                uploadCollectionManager.restoreCollection(Content, 'ContentBackup')
                    .then(function () {
                        if (!scenarioIdsArr.length)
                            return;

                        return restoreScenarioData(scenarioIdsArr);
                    }, function(){
                        returnObj.errors.push({error:'Fatal error!! Could not restore Series. Please update manually from ' +
                        'collection: ContentBackup. Error: ' + returnObj.error});
                        return returnObj;
                    })
                    .then(function () {
                        returnObj.errors.push({error:''});
                        return returnObj;
                    },
                    function (err) {
                        returnObj.errors.push({error:'Fatal error!! Could not restore Series or scenarios. Please update manually from ' +
                            'collection: ContentBackup. Error: ' + returnObj.error});
                        return returnObj;
                    }
                );
            }));
        } else {
            return resolve(data);
        }
        return Promise.all(promiseArr);
    }).then(function(data){
            if(returnObj.errors.length){
                return {status: 'failed', errors: returnObj.errors, added: returnObj.additions, updated: returnObj.updates, deleted: returnObj.deletions};
            } else {
                return {status: 'success', added: returnObj.additions, updated: returnObj.updates, deleted: returnObj.deletions};
            }
        }, function(err){
            if(err === 'error case'){
                logger.error('Error in updating content hierarchy: ',returnObj.error);
                return {status: 'failed', error:returnObj.errors, added: returnObj.additions, updated: returnObj.updates, deleted: returnObj.deletions};
            } else if(err === 'dryrun case'){
                return {status: 'dryrun', added: returnObj.additions, updated: returnObj.updates, deleted: returnObj.deletions, errors:returnObj.errors};
            } else {
                logger.error('Fatal Error in updating content hierarchy: ',returnObj.error);
                returnObj.errors.push({error:error});
                return {status: 'failed', error:returnObj.errors, added: returnObj.additions, updated: returnObj.updates, deleted: returnObj.deletions};
            }
    });
};
