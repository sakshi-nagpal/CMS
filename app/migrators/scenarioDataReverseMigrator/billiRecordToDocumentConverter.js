'use strict';

var mongoose = require('mongoose'),
    scenario = require('../../models/scenario.server.model'),
    Scenario = mongoose.model('Scenario'),
    task = require('../../models/task.server.model'),
    Task = mongoose.model('Task'),
    scenarioPhaseEnum = require('../../models/scenarioPhaseEnum.server.model'),
    ScenarioPhaseEnum = mongoose.model('scenarioPhaseEnum'),
    scenarioTypeEnum = require('../../models/scenarioTypeEnum.server.model'),
    ScenarioTypeEnum = mongoose.model('scenarioTypeEnum'),
    init = require('../../../config/init')(),
    config = require('../../../config/config'),
    util = require('util'),
    _ = require('lodash'),
    Promise = require('promise');


var scenarioCounter = 0;
var stepCounter = 0;
var methodCounter = 0;
var actionCounter = 0;
var queryCount = 0;
var recordCount = 0;


function getBilliScenarioDataAsJSON(billiScenarioFriendlyIdArray, sqlRequestObject, billiScenarioDocuments) {
    var scenarioNode = [];
    var request = sqlRequestObject;
    var concatenatedBilliScenarioIds = "'" + billiScenarioFriendlyIdArray.join("','") + "'"; // jshint ignore:line
    var queryScenario = 'select * from ' +
        '(select tas.vcTaskNo +\'.\'+ tste.vcScenarioTypeCode friendlyId , ' +	//as friendlyId
        'tasc.nScenarioID, ' +
        'us.vcFName +\' \'+ us.vcLName userName, ' +										// as userName
        'ta.vcActivityName title, ' +													// as title
        'tas.vcPageNos pageNo, ' +														// as pageNo
        'tas.vcETextURL eTextURL, ' +														//as eTextURL
        'tas.vcVideoURL videoURL, ' +														//as videoUrL
        'tspe.vcPhase phase, ' +														// as phase
        'tste.vcScenarioTypeCode scenarioType ' + 												//as scenarioType
        'from tblActivities ta ' +
        'join tblUsers us ON us.nUserID = ta.nUserID ' +
        'join tblActivitiesSections tas ON tas.nActivityID = ta.nActivityID ' +
        'join tblSections ts on ts.nSectionID = tas.nSectionID ' +
        'join tblActivitiesScenarios tasc ON tasc.nActivityID = ta.nActivityID ' +
        'join tblScenariosTypesEnum tste ON tste.nScenarioTypeID = tasc.nScenarioTypeID ' +
        'join tblScenariosPhases tsp ON tsp.nScenarioID = tasc.nScenarioID ' +
        'join tblScenariosPhasesEnum tspe ON tspe.nPhaseID = tsp.nPhaseID ' +
        'where tsp.bCurrentPhase = \'true\' and ts.nBookID in (199,200,204,205,212) and tasc.nScenarioTypeID BETWEEN 1 AND 3) as inner_table ' +
        'where friendlyId in (' + concatenatedBilliScenarioIds + ');';

    var queryStep = 'select tblItems.vcItemDesc, ' +
        'tblItems.nItemID ' +
        'from tblItems ' +
        'where tblItems.nScenarioID = %s order by tblItems.nItemNo;';

    var queryMethod = 'select tblAlternateMethodsEnum.vcMethodTypeDesc, ' +
        'tblAlternateMethods.nMethodID, ' +
        'tblAlternateMethods.nMethodTypeID, ' +
        'tblAlternateMethods.bPrimaryMethod ' +
        'from tblAlternateMethods ' +
        'join tblItems ON tblAlternateMethods.nItemID = tblItems.nItemID ' +
        'join tblAlternateMethodsEnum ON tblAlternateMethodsEnum.nMethodTypeID = tblAlternateMethods.nMethodTypeID ' +
        'where tblAlternateMethods.nItemID = %s order by tblAlternateMethods.nMethodPosition;';

    var queryAction = 'select tblActions.vcActionDesc,tblActions.vcStartTime,tblActions.vcEndTime ' +
        'from tblActions ' +
        'where tblActions.nMethodID = %s order by tblActions.nActionNo;';
    var arr = [
        {dbQuery: queryScenario},
        {dbQuery: queryStep},
        {dbQuery: queryMethod},
        {dbQuery: queryAction}
    ];

    function getScenarios() {
        var start = new Date().getTime();
        return new Promise(function (fulfill, reject) {

            request.query(util.format(arr[0].dbQuery), function (err, scenarioRecords) {
                recordCount = scenarioRecords.length;
                queryCount++;
                if (err) {
                    console.log(err);
                }
                var scenarioDocsObject = {};
                if (scenarioRecords) {
                    var PromiseArray = [];
                    scenarioRecords.forEach(function (scenario) {
                        var scenarioId = scenario.nScenarioID;
                        PromiseArray.push(makeScenarioDocument(scenario, scenarioDocsObject));
                    });
                    Promise.all(PromiseArray).then(function(){
                        var index,length;
                        for(index=0, length=billiScenarioFriendlyIdArray.length; index<length; ++index) {
                            billiScenarioDocuments.push(scenarioDocsObject[billiScenarioFriendlyIdArray[index]]);
                        }
                        fulfill();
                    });
                }
            });
        });
    }

    function makeScenarioDocument(scenarioRecord, scenarioDocuments) {
        var title = scenarioRecord.title;

        title = title.replace(/\&nbsp;/gi, ' ');
        title = title.replace(/<BR\>/gi, '');
        title = title.replace(/\&amp;/gi, '&');
        title = title.trim();

        var scenarioDocument = {
            user: {
                _id: mongoose.Types.ObjectId(),
                name: scenarioRecord.userName
            },
            friendlyId: scenarioRecord.friendlyId,
            nScenarioId: scenarioRecord.nScenarioID,
            eTextURL: scenarioRecord.eTextURL,
            videoURL: scenarioRecord.videoURL,
            title: title,
            pageNo: scenarioRecord.pageNo,
            steps: []
        };
        return new Promise(function (fulfill, reject) {
            getTaskId(scenarioRecord, scenarioDocument)
                .then(function () {
                    ++scenarioCounter;
                    console.log('Generate Scenario JSON: ', recordCount , "     ",scenarioCounter);
                    scenarioDocuments[scenarioRecord.friendlyId] = scenarioDocument;
                    fulfill();
                });
        });
    }

    function getTaskId(scenario, scenarioNode) {
        var scenarioTitle = scenarioNode.title;
        return new Promise(function (fulfill, reject) {
            Task.findOne({title: scenarioTitle}, function (err, task) {
                if (task) {
                    scenarioNode.taskId = task._id;
                }
                getScenarioPhaseEnum(scenario, scenarioNode).then(function () {
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
                getScenarioTypeEnum(scenario, scenarioNode).then(function () {
                    fulfill();
                });
            });
        });
    }

    function getScenarioTypeEnum(scenario, scenarioNode) {
        var scenarioTypeCode = scenario.scenarioType;
        return new Promise(function (fulfill, reject) {
            ScenarioTypeEnum.findOne({code: scenarioTypeCode}, function (err, scenarioType) {
                if (err) {
                    console.info('Error in finding scenario type enum.', err);
                }
                else {
                    scenarioNode.type = scenarioType.toJSON();
                }
                getSteps(scenario.nScenarioID, scenarioNode).then(function () {
                    fulfill();
                });
            });
        });
    }

    function getSteps(scenarioId, scenarioNode) {
        var query = util.format(arr[1].dbQuery, scenarioId);

        return new Promise(function (fulfill, reject) {
            request.query(query, function (err, stepRecords) {
                queryCount++;
                if (err) {
                    console.info(err);
                }
                if (stepRecords) {

                    var PromiseArray = [];
                    stepRecords.forEach(function (step) {
                        //fill stepNode
                        var stepNode = {
                            text: step.vcItemDesc,
                            methods: []
                        };
                        scenarioNode.steps.push(stepNode);

                        stepCounter++;


                        var taskId = step.nItemID;
                        PromiseArray.push(getMethods(taskId, stepNode, scenarioNode));
                    });

                    Promise.all(PromiseArray)
                        .then(function (res) {
                            fulfill();
                        });
                }
            });
        });
    }

    function getMethods(taskId, stepNode, scenarioNode) {
        var query = util.format(arr[2].dbQuery, taskId);


        return new Promise(function (fulfill, reject) {

            request.query(query, function (err, methodRecords) {
                queryCount++;
                if (err) {
                    console.info(err);
                }
                if (methodRecords) {
                    var PromiseArray = [];

                    methodRecords.forEach(function (method) {

                        var methodType = method.vcMethodTypeDesc;

                        /*if (method.vcMethodTypeDesc.lastIndexOf(' ') !== -1) {
                            methodType = method.vcMethodTypeDesc.substring(0, method.vcMethodTypeDesc.lastIndexOf(' '));
                        }*/


                        var methodNode = {
                            type: methodType,
                            primary: method.bPrimaryMethod,
                            actions: []
                        };
                        stepNode.methods.push(methodNode);
                        methodCounter++;

                        var methodId = method.nMethodID;
                        PromiseArray.push(getActions(methodId, methodNode, scenarioNode));
                    });

                    Promise.all(PromiseArray)
                        .then(function (res) {
                            fulfill();
                        });
                }
            });

        });
    }

    function getActions(methodId, methodNode, scenarioNode) {
        var query = util.format(arr[3].dbQuery, methodId);

        return new Promise(function (fulfill, reject) {

            request.query(query, function (err, actionRecords) {
                queryCount++;
                if (err) {
                    console.info(err);
                }
                if (actionRecords) {
                    actionRecords.forEach(function (action) {
                        var actionNode = {
                            text: action.vcActionDesc,
                            startTime:action.vcStartTime,
                            endTime: action.vcEndTime
                        };
                        methodNode.actions.push(actionNode);
                        actionCounter++;

                    });
                }
                fulfill();


            });

        });
    }

    return getScenarios();
}
exports.getBilliScenarioDataAsJSON = getBilliScenarioDataAsJSON;
