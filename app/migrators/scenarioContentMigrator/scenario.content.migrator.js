'use strict';

var mongoose = require('mongoose'),
    Scenario = mongoose.model('Scenario'),
    Task = mongoose.model('Task'),
    ScenarioPhaseEnum = mongoose.model('scenarioPhaseEnum'),
    ScenarioTypeEnum = mongoose.model('scenarioTypeEnum'),
    billiConnection = require('../billi/billiConnection'),
    util = require('util'),
    _ = require('lodash'),
    historyApi = require('../../modules/history.api.server.module.js'),
    Promise = require('promise');

var queryScenario = 'select tas.vcTaskNo +\'.\'+ tste.vcScenarioTypeCode friendlyId , '+	//as friendlyId
    'tasc.nScenarioID, '+
    'us.vcFName +\' \'+ us.vcLName userName, ' +										// as userName
    'tas.vcTaskNo taskFriendlyId, '+                                                   // task friendly ID
    'ta.vcActivityName title, '+													// as title
    'tas.vcPageNos pageNo, '+														// as pageNo
    'tasc.dCreatedOn createdOn, '+
    'tas.vcETextURL eTextURL, '+														//as eTextURL
    'tas.vcVideoURL videoURL, '+														//as videoUrL
    'tspe.vcPhase phase, '+														// as phase
    'tste.vcScenarioTypeCode scenarioType '+ 												//as scenarioType
    'from tblActivities ta '+
    'join tblUsers us ON us.nUserID = ta.nUserID '+
    'join tblActivitiesSections tas ON tas.nActivityID = ta.nActivityID '+
    'join tblSections ts on ts.nSectionID = tas.nSectionID '+
    'join tblActivitiesScenarios tasc ON tasc.nActivityID = ta.nActivityID '+
    'join tblScenariosTypesEnum tste ON tste.nScenarioTypeID = tasc.nScenarioTypeID '+
    'join tblScenariosPhases tsp ON tsp.nScenarioID = tasc.nScenarioID '+
    'join tblScenariosPhasesEnum tspe ON tspe.nPhaseID = tsp.nPhaseID '+
    'where tsp.bCurrentPhase = \'true\' and ts.nBookID in (%s) and tasc.nScenarioTypeID BETWEEN 1 AND 3;';

var queryStep = 'select tblItems.vcItemDesc, '+
    'tblItems.nItemID '+
    'from tblItems '+
    'where tblItems.nScenarioID = %s order by tblItems.nItemNo;';

var queryMethod = 'select tblAlternateMethodsEnum.vcMethodTypeDesc, '+
    'tblAlternateMethods.nMethodID, '+
    'tblAlternateMethods.nMethodTypeID, '+
    'tblAlternateMethods.bPrimaryMethod '+
    'from tblAlternateMethods '+
    'join tblItems ON tblAlternateMethods.nItemID = tblItems.nItemID '+
    'join tblAlternateMethodsEnum ON tblAlternateMethodsEnum.nMethodTypeID = tblAlternateMethods.nMethodTypeID '+
    'where tblAlternateMethods.nItemID = %s order by tblAlternateMethods.nMethodPosition;';

var queryAction = 'select tblActions.vcActionDesc '+
    'from tblActions '+
    'where tblActions.nMethodID = %s order by tblActions.nActionNo;';


var scenarioCounter = 0;
var stepCounter = 0;
var methodCounter = 0;
var actionCounter = 0;
var queryCount = 0;
var beforeSave = 0;
var request;

var arr = [
    {dbQuery: queryScenario},
    {dbQuery: queryStep},
    {dbQuery: queryMethod},
    {dbQuery: queryAction}
];

function getActions(methodId, methodNode,scenarioNode) {
    var query = util.format(arr[3].dbQuery, methodId);

    return new Promise(function (fulfill, reject){

        request.query(query, function(err, actionRecords){
            queryCount++;
            if(err) {
                console.info(err);
            }
            if(actionRecords) {
                actionRecords.forEach(function(action){
                    var actionNode = {
                        text: action.vcActionDesc
                    };
                    methodNode.actions.push(actionNode);
                    actionCounter++;

                });
            }
            fulfill();

        });

    });
}

function getMethods(taskId, stepNode,scenarioNode) {
    var query = util.format(arr[2].dbQuery, taskId);


    return new Promise(function (fulfill, reject){

        request.query(query, function(err, methodRecords) {
            queryCount++;
            if(err) {
                console.info(err);
            }
            if(methodRecords) {
                var PromiseArray = [];

                methodRecords.forEach(function(method) {

                    var methodType = method.vcMethodTypeDesc;

                    if(method.vcMethodTypeDesc.lastIndexOf(' ') !== -1) {
                        methodType = method.vcMethodTypeDesc.substring(0, method.vcMethodTypeDesc.lastIndexOf(' '));
                    }



                    var methodNode = {
                        type: methodType,
                        primary: method.bPrimaryMethod,
                        actions: []
                    };
                    stepNode.methods.push(methodNode);
                    methodCounter++;

                    var methodId = method.nMethodID;
                    PromiseArray.push(getActions(methodId, methodNode,scenarioNode));
                });

                Promise.all(PromiseArray)
                    .then(function (res) {
                        fulfill();
                    });
            }
        });

    });
}

function getSteps(scenarioId, scenarioNode) {
    var query = util.format(arr[1].dbQuery, scenarioId);

    return new Promise(function (fulfill, reject){

        request.query(query, function(err, stepRecords) {
            queryCount++;
            if(err) {
                console.info(err);
            }
            if(stepRecords) {

                var PromiseArray = [];
                stepRecords.forEach(function(step){
                    //fill stepNode
                    var stepNode = {
                        text: step.vcItemDesc,
                        methods: []
                    };
                    scenarioNode.steps.push(stepNode);

                    stepCounter++;


                    var taskId = step.nItemID;
                    PromiseArray.push(getMethods(taskId, stepNode,scenarioNode));
                });

                Promise.all(PromiseArray)
                    .then(function (res) {
                        fulfill();
                    });
            }
        });
    });
}

function getScenarioTypeEnum(scenario,scenarioNode) {
    var scenarioTypeCode = scenario.scenarioType;
    return new Promise(function(fulfill, reject) {
        ScenarioTypeEnum.findOne({code: scenarioTypeCode}, function(err, scenarioType) {
            if(err) {
                console.info('Error in finding scenario type enum.', err);
            }
            else {
                scenarioNode.type = scenarioType.toJSON();
            }
            getSteps(scenario.nScenarioID, scenarioNode).then(function() {
                fulfill();
            });
        });
    });
}

function getScenarioPhaseEnum(scenario, scenarioNode) {
    var scenarioPhaseCode = scenario.phase;
    return new Promise(function (fulfill, reject) {
        ScenarioPhaseEnum.findOne({code: scenarioPhaseCode}, function (err, phaseEnum) {
            if (err || !phaseEnum) {
                ScenarioPhaseEnum.findOne({code: 'DEV'}, function (err, phaseEnumObj) {
                    scenarioNode.phase = phaseEnumObj.toJSON();
                });
            }
            else {
                scenarioNode.phase = phaseEnum.toJSON();
            }
            getScenarioTypeEnum(scenario, scenarioNode).then(function() {
                fulfill();
            });
        });
    });
}

function getTaskId(scenario, scenarioNode) {
    var taskFriendlyId = scenarioNode.taskFriendlyId;
    return new Promise(function(fulfill, reject){
        Task.findOne({'data.friendlyId': taskFriendlyId}, function(err, task) {
            scenarioNode.taskId = task._id;
        });
        getScenarioPhaseEnum(scenario, scenarioNode).then(function() {
            fulfill();
        });
    });
}

function migrateScenarios(req, res , next) {

    billiConnection.startTransaction().then(function(sqlObject) {

        var bookIds = req.param('bookIds');

        if(bookIds === undefined){
            res.send('Please specify book ids to be migrated.');
            return;
        }

        var scenarioNode = [];
        request = sqlObject.sqlRequestObject;
        var start = new Date().getTime();

        request.query(util.format(arr[0].dbQuery, bookIds) , function(err, scenarioRecords) {
            queryCount++;
            if(err){
                console.log(err);
            }
            var PromiseArray = [];
            if (scenarioRecords) {
                scenarioRecords.forEach(function (scenario) {

                    var title = scenario.title;

                    title = title.replace(/\&nbsp;/gi, ' ');
                    title = title.replace(/<BR\>/gi, '');
                    title = title.replace(/\&amp;/gi, '&');
                    title = title.trim();

                    var scenarioNode = {
                        createdBy: {
                            _id : mongoose.Types.ObjectId(),
                            name:scenario.userName
                        },
                        updatedBy: {
                            _id : mongoose.Types.ObjectId(),
                            name:scenario.userName
                        },
                        friendlyId: scenario.friendlyId,
                        taskFriendlyId: scenario.taskFriendlyId,
                        createdTimestamp: scenario.createdOn,
                        //eTextURL: scenario.eTextURL,
                        //videoURL: scenario.videoURL,

                        title: title,
                        //type: type,
                        //pageNo:scenario.pageNo,
                        //phase:scenario.phase,
                        steps: []
                    };
                    var scenarioId = scenario.nScenarioID;
                    /* getScenarioPhaseEnum(scenario, scenarioNode)
                     .then(getScenarioTypeEnum(scenario,scenarioNode))*/



                    PromiseArray.push(getTaskId(scenario, scenarioNode)
                        .then(function(){
                       //     var element = new Scenario(scenarioNode);
                            beforeSave++;


                            Scenario.update({ friendlyId: scenarioNode.friendlyId}, scenarioNode,{upsert: true}, function(err) {
                                Scenario.findOne({ friendlyId: scenarioNode.friendlyId}).exec().then(function(element){

                                    if(err) {
                                        console.log(err);
                                        console.info(scenarioCounter);
                                    }
                                    else {
                                        scenarioCounter++;
                                        console.log('Total Scenarios: ', scenarioRecords.length, ' Scenarios migrated: ' + scenarioCounter);
                                        historyApi.pushScenarioToHistory(element.id,req.user,historyApi.UPDATE_TYPE_CONSTANTS.COPIED_FROM_BILLI, req.app.get('phases'));
                                    }

                                });

                            });

                        })
                    );
                });
            }
            Promise.all(PromiseArray)
                .then(function (res) {
                    console.log('Scenario Migration Successful');
                });
        });

    });
}

exports.migrateScenarios = migrateScenarios;
