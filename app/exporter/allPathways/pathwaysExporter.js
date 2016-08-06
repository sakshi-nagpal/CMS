'use strict';

var mongoose = require('mongoose'),
    scenario = require('../../models/scenario.server.model'),
    Scenario = mongoose.model('Scenario'),
    content = require('../../models/content.server.model'),
    task = require('../../models/task.server.model'),
    Content = mongoose.model('Content'),
    Task = mongoose.model('Task'),
    init = require('../../../config/init')(),
    config = require('../../../config/config'),
    Promise = require('bluebird'),
    fs = require('fs'),
    XLSXWriter = require('xlsx-writestream'),
    logger = require('../../../config/loggers/appLogger'),
    exportedData = [];

Promise.promisifyAll(fs);

var writer, workbook;
var columns = ['FriendlyId', 'Task Name', 'Step Index', 'Step Text', 'Method Index', 'Method Type','Method Status' ,'Primary Method', 'Action Index', 'Action Text', 'Start', 'End'];

//get all scenarios from BALOO-DB

var getBalooScenarioDocuments = function(req) {
    return Content.find({path: new RegExp(req.params.id), type: 'cms_task'},
        {_id:1}).exec().then(function(taskIds){
            return Scenario.find({taskId :{$in : taskIds}}).sort({'friendlyId':1}).exec();
        });
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

var removeFormatingFromText = function(string){
    //string =string.replace(/(<([^>]+)>)/ig,'');
    string = string.replace(/[\u000A\u000B\u000C\u000D\u2028\u2029\u0085]/gi,'');


    return string;
};

var exportScenarioData = function(scenario) {

    return new Promise(function(fulfill){

        var stepsArray = scenario.steps,
            friendlyId = scenario.friendlyId,
            taskName = scenario.title;

        var column = 0;
        var row ={};

        if(stepsArray.length){
            for(var stepIndex=0, stepLength=stepsArray.length; stepIndex<stepLength;) {
                var step = stepsArray[stepIndex],
                    methodsArray = step.methods,
                    stepText = removeFormatingFromText(step.text),
                    methodTypeMap = {};

                ++stepIndex;

                if(methodsArray.length){
                    for(var methodIndex=0, methodLength=methodsArray.length; methodIndex<methodLength;) {
                        var method = methodsArray[methodIndex],
                            methodType = checkMethodTypeMap(methodTypeMap, method.type),
                            bPrimaryMethod = method.primary? '1' : '0',
                            methodStatus = method.status,
                            actionsArray = method.actions;
                        ++methodIndex;

                        if(actionsArray.length){
                            for(var actionIndex=0, actionLength=actionsArray.length; actionIndex<actionLength;) {
                                var actionText = removeFormatingFromText(actionsArray[actionIndex].text);
                                var actionStart = actionsArray[actionIndex].start;
                                var actionEnd = actionsArray[actionIndex].end;

                                ++actionIndex;

                                row ={};
                                column = 0;
                                row[columns[column++]] = friendlyId;
                                row[columns[column++]] = taskName;
                                row[columns[column++]] = stepIndex;
                                row[columns[column++]] = stepText;
                                row[columns[column++]] = methodIndex;
                                row[columns[column++]] = methodType;
                                row[columns[column++]] = methodStatus;
                                row[columns[column++]] = bPrimaryMethod;
                                row[columns[column++]] = actionIndex;
                                row[columns[column++]] = actionText;
                                row[columns[column++]] = actionStart;
                                row[columns[column++]] = actionEnd;

                                exportedData.push(row);

                            }
                        }
                        else{
                            row ={};
                            column = 0;
                            row[columns[column++]] = friendlyId;
                            row[columns[column++]] = taskName;
                            row[columns[column++]] = stepIndex;
                            row[columns[column++]] = stepText;
                            row[columns[column++]] = methodIndex;
                            row[columns[column++]] = methodType;
                            row[columns[column++]] = methodStatus;
                            row[columns[column++]] = bPrimaryMethod;

                            exportedData.push(row);
                        }
                    }
                }
                else{
                    column = 0;
                    row ={};
                    row[columns[column++]] = friendlyId;
                    row[columns[column++]] = taskName;
                    row[columns[column++]] = stepIndex;
                    row[columns[column++]] = stepText;

                    exportedData.push(row);

                }
            }
        }else{
            column = 0;
            row ={};
            row[columns[column++]] = friendlyId;
            row[columns[column++]] = taskName;
            exportedData.push(row);

        }

        fulfill(exportedData);
    });

};

var exportData = function(req, res) {
    exportedData = [];

    getBalooScenarioDocuments(req).then(function(scenarios) {

        var promiseArr =[];
        scenarios.forEach(function (scenario){
            promiseArr.push(exportScenarioData(scenario));
        });
        return Promise.all(promiseArr);
    }).then(function(){

            writer.addRows(exportedData);
            writer.finalize();

    },function(err) {
            logger.error('error : ', err);
    }
    ).then(null,function(err){
            console.log(err);
        });
};

exports.getSeriesPathway = function(req, res){
    res.writeHead(200, [['Content-Type',  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
        ['Content-Disposition', 'attachment; filename=Pathways.xlsx']]);
    workbook = {};
    workbook.SheetNames = ['content'];
    writer = new XLSXWriter(workbook, { cellStyles :true, cellHTML:false}/* options */);
    writer.getReadStream().pipe(res);

    exportData(req,res);
};



