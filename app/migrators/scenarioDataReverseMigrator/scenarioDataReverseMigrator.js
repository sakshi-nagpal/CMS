'use strict';

var mongoose = require('mongoose'),
    scenario = require('../../models/scenario.server.model'),
    Scenario = mongoose.model('Scenario'),
    Promise = require('promise'),
    billiDAO = require('../billi/billiDAO'),
    billiConnection = require('../billi/billiConnection'),
    scenarioDataInsertionQueryGenerator = require('./scenarioDataInsertionQueryGenerator'),
    migrationLogger = require('../../../config/loggers/migrationLogger'),
    getBilliData = require('./billiRecordToDocumentConverter'),
    config = require('../../../config/config');

//generate billiScenarioIdArray on the basis of friendly Ids provided in billiScenarioFriendlyIdArray
var generateBilliScenarioIdArray = function(billiDAO, scenarioTypeEnum, billiScenarioFriendlyIdArray, billiScenarioIdArray, sqlRequestObject) {
    var scenarioInfoArray = [], index, length, scenarioIdPromiseArray = [];

    for(index=0, length=billiScenarioFriendlyIdArray.length; index<length; ++index) {
        var lastDotIndex = billiScenarioFriendlyIdArray[index].lastIndexOf('.');

        scenarioInfoArray.push({
            taskNumber: billiScenarioFriendlyIdArray[index].substring(0,lastDotIndex),
            scenarioType: billiScenarioFriendlyIdArray[index].substring(lastDotIndex+1)
        });
    }

    for(index=0, length=scenarioInfoArray.length; index<length; ++index) {
        var scenarioTypeId = scenarioTypeEnum[scenarioInfoArray[index].scenarioType],
            taskNumber = scenarioInfoArray[index].taskNumber;
        if(scenarioTypeId && taskNumber) {
            scenarioIdPromiseArray.push(billiDAO.getBilliScenarioIdInAuthorPhase(sqlRequestObject, taskNumber, scenarioTypeId, index, billiScenarioIdArray));
        }
    }

    return Promise.all(scenarioIdPromiseArray);
};

//find scenarios from BALOO-DB for which the friendlyIds are given in array
var getBalooScenarioDocuments = function(balooScenarioFriendlyIdArray) {
    return Scenario.find({friendlyId: {$in: balooScenarioFriendlyIdArray}}).exec();
};

//validate the baloo scenario documents and billiScenarioIdArray. And populate the response JSON
var validateScenarioIds = function(balooScenariosDocuments,balooScenarioFriendlyIdArray, billiScenarioIdArray, responseJson) {
    var atLeastOneScenarioMatches = false;

    for(var index=0, scenarioIndex=0, length=balooScenarioFriendlyIdArray.length; index<length; ++index) {
        var scenario = balooScenariosDocuments[scenarioIndex],
            friendlyId = balooScenarioFriendlyIdArray[index],
            billiScenarioId = billiScenarioIdArray[scenarioIndex];

        if(scenario && billiScenarioId) {
            atLeastOneScenarioMatches = true;
            responseJson[friendlyId] = 200;
            ++scenarioIndex;
        } else {
            billiScenarioIdArray.splice(scenarioIndex,1);
            balooScenariosDocuments.splice(scenarioIndex,1);
            responseJson[friendlyId] = 404;
        }
    }

    return balooScenariosDocuments.length && billiScenarioIdArray.length && atLeastOneScenarioMatches;
};

//error handler for migration process
var migrationErrorHandler = function(err, callback, statusCode) {
    migrationLogger.info(err);
    callback(statusCode, {
        error: err.toString()
    });
};

//MAIN function which is called to initialize the whole migration process
var migrateScenarioData = function(billiScenarioFriendlyIdArray, balooScenarioFriendlyIdArray, callback) {
    var billiScenarioIdArray = [],
        scenarioTypeEnum = {},
        methodTypeEnum = {},
        balooScenariosDocuments = [],
        responseJson = {},
        isValidIdFound = true,
        transaction, sqlRequestObject;

    //Migration Steps
    //get the scenario documents from baloo database as per the friendly ids provided
    //and start the transaction
    migrationLogger.info('sending baloo scenarios data get request');
    getBalooScenarioDocuments(balooScenarioFriendlyIdArray).then(function(scenarios) {
        migrationLogger.info('scenarios documents received');

        //get documents in the order of the friendlyIds
        var index, length, scenario, scenarioDocsObject = {};
        for(index=0, length=scenarios.length; index<length; ++index) {
            scenario = scenarios[index];
            scenarioDocsObject[scenario.friendlyId] = scenario;
        }

        for(index=0, length=balooScenarioFriendlyIdArray.length; index<length; ++index) {
            balooScenariosDocuments.push(scenarioDocsObject[balooScenarioFriendlyIdArray[index]]);
        }

        return billiConnection.startTransaction();

    //get the transaction object
    //get the scenarioTypeEnum from billi
    }).then(function(sqlObject) {
        migrationLogger.info('sql transaction started');

        transaction = sqlObject.transaction;
        sqlRequestObject = sqlObject.sqlRequestObject;

        return billiDAO.getScenarioTypeEnum(sqlRequestObject, scenarioTypeEnum);

    //generate blliScenarioIds array from the friendlyIds provided
    }).then(function() {
        migrationLogger.info('scenarioTypeEnum received');
        return generateBilliScenarioIdArray(billiDAO, scenarioTypeEnum, billiScenarioFriendlyIdArray, billiScenarioIdArray, sqlRequestObject);

    //validate tbe scenario ids for both baloo and billi
    // and create the responseJson (set 200 for ids matched and set 404 for ids not matched or not found)
    //if atleast a single id matches then delete the scenario data for matched scenarios from billi
    //else terminate the process and send the error message
    }).then(function() {
        migrationLogger.info('billi scenario id array generated');
        if(validateScenarioIds(balooScenariosDocuments, balooScenarioFriendlyIdArray, billiScenarioIdArray, responseJson)) {
            migrationLogger.info('scenario ids are valid. Proceeding further');
            return billiDAO.deleteBilliScenarioData(sqlRequestObject, billiScenarioIdArray);
        } else {
            migrationLogger.info('scenario ids are not valid. Stopping process');

            isValidIdFound = false;
            throw 'scenario ids not valid';
        }

    //get the methodTypeEnum from billi
    }).then(function() {
        migrationLogger.info('scenario data deleted');
        return billiDAO.getMethodTypeEnum(sqlRequestObject, methodTypeEnum);

    //generate insertion query for inserting the item, method and action data for the scenarios in billi
    }).then(function() {
        migrationLogger.info('method type enum received');
        return scenarioDataInsertionQueryGenerator.generate(billiScenarioIdArray, balooScenariosDocuments, methodTypeEnum, billiDAO, sqlRequestObject);

    //run the generated query on billi database
    }).then(function(scenarioDataInsertionQueryArray) {
        migrationLogger.info('insertion query generated');
        return billiDAO.executeQueryArrayOnBilli(sqlRequestObject, scenarioDataInsertionQueryArray);

    //commit the transaction
    }).then(function() {
        migrationLogger.info('data inserted');
        transaction.commit(function(err) {
            if(err) {
                migrationLogger.info('transaction commit error!!');
                migrationErrorHandler(err, callback, 500);
                return;
            }

            migrationLogger.info('scenario data migrated successfully!!');
            migrationLogger.info(responseJson);
            callback(200, responseJson);
        });

    //this is the error handler method. This gets called if any error occurs at any step performed above
    }, function(err) {
        if(transaction) {
            transaction.rollback(function() {
                migrationLogger.info('transaction rolled back');
            });

            migrationLogger.info(responseJson);

            if(!isValidIdFound) {
                callback(200, responseJson);
            } else {
                migrationErrorHandler(err, callback, 500);
            }
        }
    });
};


//MAIN function which is called to initialize the whole Billi To Billi migration process
var billiToBilliMigrateScenarioData = function(sourceBilliScenarioFriendlyIdArray, destinationBilliScenarioFriendlyIdArray, callback) {
    var billiDestinationScenarioIdArray = [],
        scenarioTypeEnum = {},
        methodTypeEnum = {},
        billiSourceScenarioDocuments = [],
        responseJson = {},
        isValidIdFound = true,
        transaction, sqlRequestObject;


    console.log("inside migration function");

    //Migration Steps
    //Start the transaction
    billiConnection.startTransaction().then(function(sqlObject){
        migrationLogger.info('sql transaction started');
        transaction = sqlObject.transaction;
        sqlRequestObject = sqlObject.sqlRequestObject;

        //get the scenario documents from billi database as per the friendly ids provided
        migrationLogger.info('sending billi scenarios data get request');
        console.log("get data from billi");
        return getBilliData.getBilliScenarioDataAsJSON(sourceBilliScenarioFriendlyIdArray,sqlRequestObject,billiSourceScenarioDocuments);
    }).then(function() {
        migrationLogger.info('Got Billi Records as Documents');

        return billiDAO.getScenarioTypeEnum(sqlRequestObject, scenarioTypeEnum);

    }).then(function() {
        migrationLogger.info('scenarioTypeEnum received');
        //generate blliScenarioIds array from the friendlyIds provided

        return generateBilliScenarioIdArray(billiDAO, scenarioTypeEnum, destinationBilliScenarioFriendlyIdArray, billiDestinationScenarioIdArray, sqlRequestObject);

    }).then(function() {
        migrationLogger.info('billi scenario id array generated');

        //validate tbe Source and Destination Scenario Ids from billiSourceScenarioDocuments Array and billiDestinationScenarioIdArray HashMap
        // and create the responseJson (set 200 for ids matched and set 404 for ids not matched or not found)
        //if atleast a single id matches then delete the destination scenario data for matched scenarios from billi
        //else terminate the process and send the error message

        if(validateScenarioIds(billiSourceScenarioDocuments, sourceBilliScenarioFriendlyIdArray, billiDestinationScenarioIdArray, responseJson)) {
            migrationLogger.info('scenario ids are valid. Proceeding further');
            return billiDAO.deleteBilliScenarioData(sqlRequestObject, billiDestinationScenarioIdArray, true);
        } else {
            migrationLogger.info('scenario ids are not valid. Stopping process');
            isValidIdFound = false;
            throw 'scenario ids not valid';
        }
    }).then(function() {
        migrationLogger.info('scenario data deleted');
        //get the methodTypeEnum from billi
        return billiDAO.getMethodTypeEnum(sqlRequestObject, methodTypeEnum);
    }).then(function() {
        migrationLogger.info('method type enum received');
        //generate insertion query for inserting the item, method and action data for the scenarios in billi
        return scenarioDataInsertionQueryGenerator.generate(billiDestinationScenarioIdArray, billiSourceScenarioDocuments, methodTypeEnum, billiDAO, sqlRequestObject,true,true);

    }).then(function(scenarioDataInsertionQueryArray) {
        migrationLogger.info('insertion query generated: ', scenarioDataInsertionQueryArray.length );
        //run the generated query on billi database
        return billiDAO.executeQueryArrayOnBilli(sqlRequestObject, scenarioDataInsertionQueryArray);
    }).then(function() {

        migrationLogger.info(JSON.stringify(responseJson));
        /*transaction.rollback(function() {
            migrationLogger.info('transaction rolled back');
            callback(200, responseJson);
        });*/
        //commit the transaction
        transaction.commit(function(err) {
            if(err) {
                migrationLogger.info('transaction commit error!!');
                migrationErrorHandler(err, callback, 500);
                return;
            }

            migrationLogger.info('scenario data migrated successfully!!');
            migrationLogger.info(responseJson);
            callback(200, responseJson);
        });

        //this is the error handler method. This gets called if any error occurs at any step performed above
    }, function(err) {
        if(transaction) {
            transaction.rollback(function() {
                migrationLogger.info('transaction rolled back');
            });

            migrationLogger.info(responseJson);

            if(!isValidIdFound) {
                callback(200, responseJson);
            } else {
                migrationErrorHandler(err, callback, 500);
            }
        }
    });
};

// initialize migration logger
var externalLogDir = config.getUserHome() +'/.baloo';
migrationLogger.init(externalLogDir);

exports.migrate = migrateScenarioData;
exports.billiToBilliMigrate = billiToBilliMigrateScenarioData;
