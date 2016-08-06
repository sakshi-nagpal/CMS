'use strict';

var Promise = require('promise');
var migrationLogger = require('../../../config/loggers/migrationLogger');

//Delete Actions for scenarioIds provided in concatenatedBilliScenarioIds
var deleteActions = function(sqlRequestObject, concatenatedBilliScenarioIds) {
    var deleteActionsQuery = 'delete action from tblActions action ' +
        'join  tblAlternateMethods method on method.nMethodId = action.nMethodId ' +
        'join tblItems item on item.nItemId = method.nItemId ' +
        'where item.nScenarioId in (' + concatenatedBilliScenarioIds + ');';

    return sqlRequestObject.query(deleteActionsQuery);
};

//Delete Methods for scenarioIds provided in concatenatedBilliScenarioIds
var deleteMethods = function(sqlRequestObject, concatenatedBilliScenarioIds) {
    var deleteMethodsQuery = 'delete method from tblAlternateMethods method ' +
        'join tblItems item on item.nItemId = method.nItemId ' +
        'where item.nScenarioId in (' + concatenatedBilliScenarioIds + ');';

    return sqlRequestObject.query(deleteMethodsQuery);
};

//Delete Items for scenarioIds provided in concatenatedBilliScenarioIds
var deleteItems = function(sqlRequestObject, concatenatedBilliScenarioIds) {
    var deleteItemsQuery = 'delete item from tblItems item ' +
        'where item.nScenarioId in (' + concatenatedBilliScenarioIds + ');';

    return sqlRequestObject.query(deleteItemsQuery);
};

var deleteScenarioDocs = function(sqlRequestObject, concatenatedBilliScenarioIds){
    var deleteScenarioDocsQuery = 'delete from tblScenariosDocs  ' +
        'where nScenarioId in (' + concatenatedBilliScenarioIds + ');';

    return sqlRequestObject.query(deleteScenarioDocsQuery);
};
//get MethodTypeEnum from the table tblAlternateMethodsEnum in billi database
var getMethodTypeEnum = function(sqlRequestObject, methodTypeEnum) {
    var methodTypeEnumQuery = 'select nMethodTypeId, vcMethodTypeDesc from tblAlternateMethodsEnum;',
        queryPromise = sqlRequestObject.query(methodTypeEnumQuery);

    queryPromise.then(function(methodTypeEnumRecords) {

        if(methodTypeEnumRecords && methodTypeEnumRecords.length)
            for(var index=0, length=methodTypeEnumRecords.length; index<length; ++index)
                methodTypeEnum[methodTypeEnumRecords[index].vcMethodTypeDesc] = methodTypeEnumRecords[index].nMethodTypeId;

    });

    return queryPromise;
};

//delete items , methods and actions records which belong to scenarios present in billiScenarioIdArray
exports.deleteBilliScenarioData = function(sqlRequestObject, billiScenarioIdArray,deleteScenarioDocsFlag) {
    var concatenatedBilliScenarioIds = billiScenarioIdArray.join();

    return deleteActions(sqlRequestObject, concatenatedBilliScenarioIds)
        .then(function() {
            return deleteMethods(sqlRequestObject, concatenatedBilliScenarioIds);
        })
        .then(function() {
            return deleteItems(sqlRequestObject, concatenatedBilliScenarioIds);
        })
        .then(function(){
            if(deleteScenarioDocsFlag){
                return deleteScenarioDocs(sqlRequestObject, concatenatedBilliScenarioIds);
            }
        });
};

exports.getMethodTypeEnum = getMethodTypeEnum;

//Run the query array one by one on the billi database
exports.executeQueryArrayOnBilli = function(sqlRequestObject, scenarioDataInsertionQueryArray) {
    var queryPromiseArray = [];
    var queryPromise;
    migrationLogger.info('Query Length'+scenarioDataInsertionQueryArray.length);
    var querySuccess = 0;
    for(var index=0, length=scenarioDataInsertionQueryArray.length; index<length; ++index) {
        queryPromise = sqlRequestObject.query(scenarioDataInsertionQueryArray[index]);
        var currentQuery =scenarioDataInsertionQueryArray[index];
        queryPromise.then(function(){
            ++querySuccess;
            console.log('querySuccess',querySuccess);
        },function(err){
            migrationLogger.info('Error');
            migrationLogger.info(err);
            migrationLogger.info('Promise');
            migrationLogger.info(queryPromise);
            migrationLogger.info('Error Query '+currentQuery);
            console.log('Promise Failed',queryPromise);
            console.log('Error',err);
        });
        queryPromiseArray.push(queryPromise);
    }
    return Promise.all(queryPromiseArray);
};

//get ScenarioTypeEnum from the table tblScenariosTypesEnum in billi database
exports.getScenarioTypeEnum = function(sqlRequestObject, scenarioTypeEnum) {
    var scenarioTypeEnumQuery = 'select nScenarioTypeId, vcScenarioTypeCode from tblScenariosTypesEnum;',
        queryPromise = sqlRequestObject.query(scenarioTypeEnumQuery);

    queryPromise.then(function(scenarioTypeEnumRecords) {

        if(scenarioTypeEnumRecords && scenarioTypeEnumRecords.length)
            for(var index=0, length=scenarioTypeEnumRecords.length; index<length; ++index)
                scenarioTypeEnum[scenarioTypeEnumRecords[index].vcScenarioTypeCode] = scenarioTypeEnumRecords[index].nScenarioTypeId;

    });

    return queryPromise;
};


//insert the method types in tblAlternateMethodsEnum table in billi database which are not present already
//and call getMethodTypeEnum method to update the methodTypeEnum with new data in tblAlternateMethodsEnum table
exports.insertMethodTypes = function(sqlRequestObject, methodTypes, methodTypeEnum) {
    var insertionQuery = 'insert into tblAlternateMethodsEnum(vcMethodTypeDesc) values';

    for(var index=0, length=methodTypes.length; index<length; ++index) {
        insertionQuery += "('" + methodTypes[index] +"'),"; // jshint ignore:line
    }

    insertionQuery = insertionQuery.substring(0, insertionQuery.length - 1) + ';';

    return sqlRequestObject.query(insertionQuery)
        .then(function() {
            return getMethodTypeEnum(sqlRequestObject, methodTypeEnum);
        });
};

//get the scenarioId as per the query provided and push it into the billiScenarioIdArray
exports.getBilliScenarioId = function(sqlRequestObject, scenarioIdQuery, index, billiScenarioIdArray) {
    var queryPromise = sqlRequestObject.query(scenarioIdQuery);

    queryPromise.then(function(scenarioIdRecords) {
        if(scenarioIdRecords && scenarioIdRecords.length)
            billiScenarioIdArray[index] = scenarioIdRecords[0].nScenarioId;
    });

    return queryPromise;
};

exports.getBilliScenarioIdInAuthorPhase = function(sqlRequestObject, taskNumber, scenarioTypeId, index, billiScenarioIdArray) {
    var scenarioIdQuery = 'select Sce.nScenarioId from tblActivitiesScenarios Sce ' +
        'join tblActivitiesSections ActSec on ActSec.nActivityId=Sce.nActivityId ' +
        "where ActSec.vcTaskNo='" + taskNumber + "' AND Sce.nScenarioTypeId=" + scenarioTypeId + ';',  // jshint ignore:line

        scenarioId = null,
        queryPromise = sqlRequestObject.query(scenarioIdQuery).then(function(scenarioIdRecord) {
        if(scenarioIdRecord && scenarioIdRecord.length) {
            //scenarioId found
            scenarioId = scenarioIdRecord[0].nScenarioId;

            var phaseQuery = "select sp.nPhaseID from tblScenariosPhases sp join tblScenariosPhasesEnum spe on spe.nPhaseID = sp.nPhaseID where sp.nScenarioID=" + scenarioId + "and sp.bCurrentPhase=1 and spe.vcPhase='AUT'"; // jshint ignore:line
            return sqlRequestObject.query(phaseQuery);
        } else {
            //scenarioId not found
            return new Promise(function(fulfill) {
                fulfill(null);
            });
        }
    });

    queryPromise.then(function(phaseIdRecord) {
        if(phaseIdRecord && phaseIdRecord.length) {
            billiScenarioIdArray[index] = scenarioId;
        }
    });

    return queryPromise;
};
