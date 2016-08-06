'use strict';
var mongoose = require('mongoose'),
    content = require('../../models/content.server.model.js'),
    Content = mongoose.model('Content'),
    scenario = require('../../models/scenario.server.model.js'),
    Scenario = mongoose.model('Scenario'),
    init = require('../../../config/init')(),
    config = require('../../../config/config'),
    errorHandler = require('../../controllers/errors.server.controller'),
    util = require('util'),
    fs = require('fs'),
    path = require('path'),
    logger = require('../../../config/loggers/appLogger'),
    Promise = require('bluebird'),
    XLSXWriter = require('xlsx-writestream');

Promise.promisifyAll(fs);



var commonFields = {};
var rows = [];
var taskIdsObj = {};
var index = 0;
var writer, workbook;

var columns = ['JIRA Project', 'Key', 'Summary','Issue_Type','TaskID','Component','Project No.','Project','Chapter','Status','Priority','Resolution','SIMSApplication','BookSeries','Scenario','No of Steps','Label','Assignee','Reporter', 'Baloo_Phase'];

function createCommonFields(){
    commonFields.project = ' ';
    commonFields.key = '';
    commonFields.issueType = 'SLE';
    commonFields.status= '';
    commonFields.priority = '';
    commonFields.resolution = '';
    commonFields.label = '';
    commonFields.assignee = '';
    commonFields.reporter = '';
}

var createNewWorkBook = function(res){
    res.writeHead(200, [['Content-Type',  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
        ['Content-Disposition', 'attachment; filename=TaskData.xlsx']]);
    workbook = {};
    workbook.SheetNames = ['content'];
    writer = new XLSXWriter(workbook, {type:'buffer'} /* options */);
    writer.getReadStream().pipe(res);
};

var checkMethodTypeMap = function(methodTypeMap, methodType) {
    var methodTypeCount = methodTypeMap[methodType];

    if(methodTypeCount) {
        methodTypeMap[methodType] = ++methodTypeCount;
        methodType = methodType + ' (' + methodTypeCount + ')';
    } else {
        methodTypeMap[methodType] = 1;
    }

    return methodType;
};

var getTaskIds = function(seriesId, next){
    return new Promise(function(resolve,reject){
        Content.find({path: new RegExp(seriesId), type: 'cms_task'},{_id:1})
            .exec().then(function(data){
                resolve(data);
            },function(err){
                reject(err);
            });
    });
};

var getTaskFromFriendlyId = function(friendlyId){
    var taskFriendlyId = friendlyId.split('.').slice(0,-1).join('.');

    return new Promise(function(fulfill) {
        if( taskIdsObj[taskFriendlyId]){
            return fulfill(taskIdsObj[taskFriendlyId]);
        }else{
            Content.findOne({'data.friendlyId': taskFriendlyId}).exec().then(function(task){
                taskIdsObj[taskFriendlyId] = task;
                return fulfill(task);
            });
        }
    })
};

var getAncestors = function(element, taskData) {
    return new Promise(function(fulfill) {
        element.getAncestors(function(err, ancestors){
            var ancestorsLength = ancestors.length;
            // need chapter and project only
            taskData.project = ancestors[ancestorsLength-1].title;
            taskData.chapter = ancestors[ancestorsLength-2].title;
            fulfill(taskData);
        });
    });
};


function addScenarioDetailsToSpreadSheet(data){
    var taskData= {};
    return getTaskFromFriendlyId(data.friendlyId).then(function(task){
        taskData = {
            app : task.app
        };
        return  getAncestors(task,taskData)
    }).then(function(taskData){
        return new Promise(function(fulfill) {
            var row = {};
            var scenarioObj = data;
            var detailsArr = scenarioObj.friendlyId.split('.');
            var scenarioType = detailsArr[detailsArr.length - 1];
            var bookSeries = detailsArr[0];
            detailsArr.splice(detailsArr.length-1,1);
            var scenarioSummary =  scenarioObj.friendlyId + ' - '+ scenarioObj.title.split(':')[0];
            var steps = scenarioObj.steps;
            var stepLength = steps.length;
            var methods = steps,methodLength;
            var newRow =[];
            var column =0;

            row[columns[column++]] = commonFields.project;
            row[columns[column++]] = commonFields.key;
            row[columns[column++]] = scenarioSummary;
            row[columns[column++]] = commonFields.issueType;
            row[columns[column++]] = scenarioObj.friendlyId;
            row[columns[column++]] = detailsArr.join('.');
            row[columns[column++]] = detailsArr[detailsArr.length-2];
            row[columns[column++]] = taskData.project;
            row[columns[column++]] = taskData.chapter;
            row[columns[column++]] = commonFields.status;
            row[columns[column++]] = commonFields.priority;
            row[columns[column++]] = commonFields.resolution;
            row[columns[column++]] = taskData.app.split(' ')[0];
            row[columns[column++]] = bookSeries;
            row[columns[column++]] = scenarioType;
            row[columns[column++]] = stepLength;
            row[columns[column++]] = commonFields.label;
            row[columns[column++]] = commonFields.assignee;
            row[columns[column++]] = commonFields.reporter;
            row[columns[column++]] = scenarioObj.phase.code;

            rows[index++] = row ;

            if(stepLength) {
                steps.forEach(function (step, stepIndex) {
                    var methodTypeMap = {};
                    methods = steps[stepIndex].methods;
                    methodLength = methods.length;
                    if (methodLength) {   //required or not
                        methods.forEach(function (method, methodIndex) {
                            var methodType = checkMethodTypeMap(methodTypeMap, method.type);
                            row = {};
                            column = 0;
                            var methodNum = method.primary == true ? 'Primary Method' : 'Method' + (methodIndex + 1);
                            row[columns[column++]] = commonFields.project;
                            row[columns[column++]] = commonFields.key;
                            row[columns[column++]] = 'Item' + (stepIndex + 1) + ' -->' + methodNum + ' : ' + methodType;
                            row[columns[column++]] = 'Method';
                            row[columns[column++]] = scenarioObj.friendlyId;
                            row[columns[column++]] = detailsArr.join('.');
                            row[columns[column++]] = detailsArr[detailsArr.length-2];
                            row[columns[column++]] = taskData.project;
                            row[columns[column++]] = taskData.chapter;
                            row[columns[column++]] = commonFields.status;
                            row[columns[column++]] = commonFields.priority;
                            row[columns[column++]] = commonFields.resolution;
                            row[columns[column++]] = taskData.app.split(' ')[0];
                            row[columns[column++]] = bookSeries;
                            row[columns[column++]] = scenarioType;
                            row[columns[column++]] = stepLength;
                            row[columns[column++]] = commonFields.label;
                            row[columns[column++]] = commonFields.assignee;
                            row[columns[column++]] = commonFields.reporter;
                            row[columns[column++]] = scenarioObj.phase.code;
                            rows[index++] = row;


                        })
                    }
                })
            }
            fulfill();
        });

    })


}

//get a scenario detail
function getScenarioDetails(data){
    return Scenario.findOne({'friendlyId' :data}).exec().then(function(scenarioObj){
        if (!scenarioObj) {
            throw new errorHandler.error.MalformedRequest('No such task Id exists');
        }else{
            return scenarioObj.toJSON();

        }
    }).then(function(data){
        return addScenarioDetailsToSpreadSheet(data);
    });
}

function getScenarioDetailsFromSeries(data){

    return new Promise(function(resolve,reject){
       Scenario.find({'taskId': data}).sort({'friendlyId':1}).exec().then(function(data){
                resolve(data);
            },function(err){
                logger.error('error fetching task : ', err);
                reject(err);
            })
    }).then(function(data){
            var scenarioObjLength = data.length;
            var promisesArr = [];
            for (var i= 0;i <scenarioObjLength;i++ ){
                promisesArr.push(addScenarioDetailsToSpreadSheet(data[i]));
            }
            return Promise.all(promisesArr);
        });
}

function getAllScenarioDetails(dataArr){

    var promisesArr = [], friendlyID;
    for(var i = 0;i<dataArr.length;i++){
        friendlyID = dataArr[i].trim();
        promisesArr.push(getScenarioDetails(friendlyID));
    }
    //resolve all promises
    return Promise.all(promisesArr);


}

function getAllScenarioDetailsFromSeries(taskIds){

    var promisesArr = [], scenarioIds ;
    for(var i = 0;i<taskIds.length;i++){
        scenarioIds = taskIds[i]._id;
      promisesArr.push(getScenarioDetailsFromSeries(scenarioIds));
    }
    //resolve all promises
    return Promise.all(promisesArr);


}

function exportDataByInput(req,res,next){
    index =0;
    rows = [];
    createNewWorkBook(res);

    (function () {
        return new Promise(function (resolve,reject) {
            //add the common fields

            createCommonFields();
            resolve(req.query.inputJson.split(','));
        });

    })().then(function(dataArr){

        //get all the scenario details
        return getAllScenarioDetails(dataArr);
    }).then(function(){


        rows.sort(function(a,b){
            if (a[columns[4]] < b[columns[4]]) //sort on Friendly Id
                return -1;
            if (a[columns[4]] > b[columns[4]])
                return 1;
            return 0
        });

        writer.addRows(rows);
        writer.finalize();


    },function (err) {
        logger.error('error writing to spreadsheet : ', err);
        writer.finalize();

    });
}

function exportDataBySeries(req,res,next){
    rows = [];
    index = 0;
    createNewWorkBook(res);
    createCommonFields();
    getTaskIds(req.params.id).then(function(taskIds){
        return getAllScenarioDetailsFromSeries(taskIds);
    }).then(function(){
        rows.sort(function (a, b) {
            if (a[columns[4]] < b[columns[4]]) //friendlyId
            {
                return -1;
            }
            else if (a[columns[4]] > b[columns[4]])
            {
                return 1;
            }
            else
            {
                if (a[columns[2]] < b[columns[2]])  //summary
                {
                    return -1;
                }
                else if (a[columns[2]] > b[columns[2]])
                {
                    return 1;
                }
                return 0;
            }
        });

        writer.addRows(rows);
        writer.finalize();

    },function (err) {
        logger.error('error generating spreadsheet: ', err);
        next(err);
    });
}


exports.exportDataByInput = exportDataByInput;
exports.exportDataBySeries = exportDataBySeries;

