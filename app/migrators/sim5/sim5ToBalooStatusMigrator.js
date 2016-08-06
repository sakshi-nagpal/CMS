var simsConnection = require("./simsConnection"),
    billiConnection = require("../billi/billiConnection"),
    Promise = require('promise'),
    mongoose = require('mongoose'),
    migrationLogger = require('../../../config/loggers/migrationLogger'),
    Scenario = mongoose.model('Scenario'),
    Task = mongoose.model('Task'),
    sql = require('mssql'),
    util = require('util'),
    Q = require('q'),
    config = require('../../../config/config');


var externalLogDir = config.getUserHome() +'/.baloo';
migrationLogger.init(externalLogDir);

exports.simsToBalooScenarioPathwayStatusMigrator = function (req, res) {
    var simsConnectionPromise = simsConnection.startTransaction(),
        billiConnectionPromise = billiConnection.startTransaction(),
        billiSqlRequestObject;

    Promise.all([simsConnectionPromise, billiConnectionPromise]).then(function (responseArray) {
        var request = responseArray[0].sqlRequestObject;
        billiSqlRequestObject = responseArray[1].sqlRequestObject;
        return getAllMethodsFromSIMS(request);
    }).then(function (simsMethodRecords) {
        console.log("Sim5 Method Total Count:",simsMethodRecords.length);
        migrationLogger.info("Sim5 Method Total Count:"+simsMethodRecords.length);
        var iterationCount = 0;
        var result = Q();
        simsMethodRecords.forEach(function (record, index) {
            var isActiveStatus = (record['IsActive']) ? 'supported' : 'unsupported',
                billiMethodId = record['MethodSrcId'],
                billiMethodName = record['MethodName'];
            result = result.then(function () {
                return new Promise(function (fulfill, reject) {
                    //Get method position, item position and friendlyId From Billi if method exists in billi

                    getMethodStatusFromBilli(billiSqlRequestObject, billiMethodId).then(function (methodStatus) {
                        var methodPosition = methodStatus['methodPosition'],
                            itemPosition = methodStatus['itemPosition'],
                            friendlyId = methodStatus['friendlyId'];
                        migrationLogger.info( billiMethodId+ "\t" +methodPosition + "\t" + itemPosition + "\t" + friendlyId);

                        Scenario.findOne({'friendlyId': friendlyId}).exec().then(function (scenario) {

                            //Step Not Found in Baloo
                            if(!(scenario.steps[itemPosition - 1])){
                                ++iterationCount;
                                console.log("Step Not Found for:"+scenario.friendlyId + "Iteration:" + iterationCount);
                                migrationLogger.info("Step Not Found for:"+scenario.friendlyId + " Step Position: "+itemPosition - 1 +"Iteration:"+ iterationCount+'\n');
                                fulfill();
                                return;
                            }

                            //Method Not Found in Baloo
                            if(!(scenario.steps[itemPosition - 1].methods[methodPosition - 1])){
                                ++iterationCount;
                                console.log("Method Not Found in Baloo for: "+scenario.friendlyId + " Iteration:" + iterationCount);
                                migrationLogger.info("Method Not Found in Baloo for:"+scenario.friendlyId +" Step Position "+ (itemPosition - 1)+" Method Position "+(methodPosition - 1)+ " Iteration:" + iterationCount+"\n");
                                fulfill();
                                return;
                            }

                            var match = /\([0-9]*\)/.exec(billiMethodName);
                            if (match) {
                                billiMethodName = billiMethodName.substring(0,match.index).trim();
                            }

                            migrationLogger.info(scenario.steps[itemPosition - 1].methods[methodPosition - 1].type + "\t" + billiMethodName);
                            if (scenario.steps[itemPosition - 1].methods[methodPosition - 1].type === billiMethodName) {
                                scenario.steps[itemPosition - 1].methods[methodPosition - 1].status = isActiveStatus;
                                //Update the Baloo scenario document with isActiveStatus
                                scenario.save(function (err) {
                                    if (err) {
                                        migrationLogger.info("Error While Saving Scenario");
                                        fulfill();
                                        return;
                                    }
                                    ++iterationCount;
                                    console.log("Updated: "+scenario.friendlyId + " Iteration: " + iterationCount);
                                    migrationLogger.info("Updated: "+scenario.friendlyId + " Iteration: " + iterationCount+'\n');

                                    fulfill();
                                });
                            }else{
                                ++iterationCount;
                                console.log("Method Name Match Failed :"+scenario.friendlyId +" Step Position "+ (itemPosition - 1)+" Method Position "+(methodPosition - 1)+ " Iteration: "+iterationCount);
                                migrationLogger.info("Method Name Match Failed :"+scenario.friendlyId +" Step Position "+ (itemPosition - 1)+" Method Position "+(methodPosition - 1)+ " Iteration: "+iterationCount+'\n');
                                fulfill();
                            }
                        });

                    }, function (err) {
                        ++iterationCount;
                        console.log("Method Not Found in Billi" + iterationCount);
                        migrationLogger.info("Method Not Found in Billi "+record["FriendlyID"]+" Billi MethodId "+billiMethodId+" Billi Method Name "+billiMethodName);
                        fulfill();
                    });
                });
            });


        });
        result.then(function(){
            console.log("!!!STATUS UPDATE DONE!!!");
            migrationLogger.info("STATUS UPDATE DONE!!!");
            billiConnection.closeConnection();
            simsConnection.closeConnection();
        });

    }, function (err) {
        console.log("Error");
        console.log(err);
        migrationLogger.info("Error");
        migrationLogger.info(err);
    });

};

var getAllMethodsFromSIMS = function (sqlRequestObject) {
    var getMethodQuery = 'select ts.FriendlyID,sci.OrderNo as ItemPosition,penum.Name as MethodName,ip.Position as MethodPosition,ip.IsActive,ts.SrcId as ScenarioSrcID, ip.SrcId as MethodSrcId ' +
        'from ItemPathways as ip join PathwayEnum as penum on ip.PathwayEnumId = penum.Id ' +
        'join ScenarioItems as sci on ip.ItemID = sci.Id ' +
        'join TaskScenario ts on ts.Id = sci.ScenarioId ' +
        'join TaskMaster as tm on tm.Id = ts.TaskId;';

    return sqlRequestObject.query(util.format(getMethodQuery));
};

var getMethodStatusFromBilli = function (billiSqlRequestObject, billiMethodId) {

    var getMethodStatusQuery = 'select tam.nMethodID,tam.nMethodPosition,ti.nItemNo,tasec.vcTaskNo +\'.\'+ tstenum.vcScenarioTypeCode as FriendlyId ' +
        'from tblAlternateMethods as tam join tblItems as ti on ti.nItemID = tam.nItemID ' +
        'join tblActivitiesScenarios as tasce on tasce.nScenarioID = ti.nScenarioID ' +
        'join tblActivitiesSections as tasec on tasce.nActivityID = tasec.nActivityID ' +
        'join tblScenariosTypesEnum as tstenum on tstenum.nScenarioTypeID = tasce.nScenarioTypeID ' +
        'where tam.nMethodID =  %s ;';

    var methodStatus = {};

    return new Promise(function (fulfill, reject) {
        billiSqlRequestObject.query(util.format(getMethodStatusQuery, billiMethodId), function (err, recordset) {
            if (err || recordset.length == 0) {
                migrationLogger.info("Error "+ billiMethodId);
                reject(err);
                return;
            }
            methodStatus.methodPosition = recordset[0].nMethodPosition;
            methodStatus.itemPosition = recordset[0].nItemNo;
            methodStatus.friendlyId = recordset[0].FriendlyId;
            fulfill(methodStatus);
        });
    });
};

exports.simsToBalooTaskScenarioIsActiveMigrator = function(req, res){
    simsConnection.startTransaction().then(function (sqlObject) {
        var sqlRequestObject = sqlObject.sqlRequestObject;
        var sim5ArrPromises = [];

        sim5ArrPromises.push(updateBalooScenariosIsActive(sqlRequestObject));
        sim5ArrPromises.push(updateBalooTaskIsActive(sqlRequestObject));
        Promise.all(sim5ArrPromises).then(function(data){
            console.log("!!!! MIGRATION DONE !!!!");
            migrationLogger.info("!!!! MIGRATION DONE !!!!");
            simsConnection.closeConnection();
        });
    },function(err){
        console.log("Connection not established");
        migrationLogger.info(err);
    });
};

var updateBalooScenariosIsActive = function(sqlRequestObject){
    var getScenarioFriendlyIdQuery = 'select FriendlyId, IsActive from TaskScenario';
    var scenarioArrPromise = [];
    var j=0;

    return sqlRequestObject.query(util.format(getScenarioFriendlyIdQuery)).then(function(recordset) {
        console.log("SCENARIOS LENGTH",recordset.length);
        migrationLogger.info("SCENARIOS LENGTH",recordset.length);

        recordset.forEach(function (scenario, index) {
            var scenarioFriendlyId = scenario.FriendlyId;
            scenarioArrPromise.push(
                Scenario.update(
                    {'friendlyId': scenario.FriendlyId},
                    {'$set': {'isActive': scenario.IsActive}}).exec()
                    .then(function (scenario) {
                        j++;
                        if(scenario.nModified == 0){
                            console.log("Iteration: ",j," Scenario FriendlyID not modified : ",scenarioFriendlyId);
                            migrationLogger.info("Iteration: ",j," Scenario FriendlyID not modified : ",scenarioFriendlyId);
                        }else{
                            console.log("Iteration : ",j," Scenario FriendlyId : ",scenarioFriendlyId);
                            migrationLogger.info("Iteration : ",j," Scenario FriendlyId : ",scenarioFriendlyId);
                        }
                    },function(err){
                        console.log("Error while updating scenario:",scenarioFriendlyId," Error :",err);
                        migrationLogger.info("Error while updating scenario:",scenarioFriendlyId," Error :",err);
                    })
            )
        });
        return Promise.all(scenarioArrPromise).then(function (data) {
            console.log("SCENARIOS UPDATED");
            migrationLogger.info("SCENARIOS UPDATED");
        }, function (err) {
            console.log('Error while migrating Scenario:', err);
            migrationLogger.info('Error while migrating Scenario:', err);
        })
    });
};

var updateBalooTaskIsActive = function(sqlRequestObject){
    var getTaskFriendlyIdQuery = "select FriendlyTaskId,IsActive from TaskMaster;"
    var taskArrPromise = [];
    var i=0;

    return sqlRequestObject.query(util.format(getTaskFriendlyIdQuery)).then(function(recordset) {
        console.log("TASK LENGTH",recordset.length);
        migrationLogger.info("TASK LENGTH",recordset.length);
        recordset.forEach(function (task, index) {
            var taskFriendlyId = task.FriendlyTaskId;
            taskArrPromise.push(
                Task.update(
                    {'data.friendlyId': task.FriendlyTaskId},
                    {'$set': {'data.isActive': task.IsActive}}).exec()
                    .then(function (task) {
                        i++;
                        if(task.nModified == 0){
                            console.log("Iteration: ",i," Task FriendlyID not modified : ",taskFriendlyId);
                            migrationLogger.info("Iteration: ",i," Task FriendlyID not modified : ",taskFriendlyId);
                        }
                        else{
                            console.log("Iteration: ",i," Task FriendlyID : ",taskFriendlyId);
                            migrationLogger.info("Iteration: ",i," Task FriendlyID : ",taskFriendlyId);
                        }
                },function(err){
                    console.log("Error while updating task",err);
                    migrationLogger.info("Error while updating task",err);
                })
            )}
        );
        return Promise.all(taskArrPromise).then(function (data) {
            Task.update({'data.friendlyId': 'EXP13.PPT13.01.01.01'},{'$set': {'data.isActive': true}}).exec();
            console.log("TASKS UPDATED");
            migrationLogger.info("TASKS UPDATED");
        }, function (err) {
            console.log('Error while migrating task:', err);
            migrationLogger.info('Error while migrating task:', err);
        })
    });
};
