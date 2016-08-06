
'use strict';

//delimiter used to wrap around the method types which are not present in method type enum to insert in scenario data insertion query
//which is replaced with the method type id after the insertion of the method type in the tblAlternateMethodsEnum
var methodTypeDelimiter_sorry = '~#@$~*',
    newMethodTypes = [],
    Promise = require('promise');

//escape single quote from text description in billi insertion query script
//replace 1 single quote with 2 single quotes
var escapeSingleQuote = function(str) {
    return str.split("'").join("''"); // jshint ignore:line
};

//check for the methodType in the methodTypeEnum and provide the corresponding methodTypeId
//OR
//If method type not present in methodTypeEnum then add it to newMethodTypes array
//and return the methodTypeappended with the methodTypeDelimiter_sorry
var checkMethodTypeMap = function(methodTypeMap, methodType, methodTypeEnum) {
    var methodTypeCount = methodTypeMap[methodType];

    if(methodTypeCount) {
        methodTypeMap[methodType] = ++methodTypeCount;
        methodType = methodType + ' (' + methodTypeCount + ')';
    } else {
        methodTypeMap[methodType] = 1;
    }

    var methodTypeId = methodTypeEnum[methodType];

    if(methodTypeId === undefined) {
        methodTypeId = methodTypeDelimiter_sorry + methodType + methodTypeDelimiter_sorry;

        if(newMethodTypes.indexOf(methodType) < 0)
            newMethodTypes.push(methodType);
    }

    return methodTypeId;
};

var buildQueryArray = function(billiScenarioIdArray, balooScenariosDocuments, methodTypeEnum,updateTaskMetaDataFlag,copyScenarioDocsFlag) {
    var scenarioDataInsertionQueryArray = [];
    for(var scenarioIndex=0, scenarioLength=billiScenarioIdArray.length; scenarioIndex<scenarioLength; ++scenarioIndex) {
        var billiScenarioId = billiScenarioIdArray[scenarioIndex],
            sourceBilliScenarioId = balooScenariosDocuments[scenarioIndex].nScenarioId,
            stepsArray = balooScenariosDocuments[scenarioIndex].steps,
            scenarioDataInsertionQuery = 'DECLARE @itemId INT DECLARE @methodId INT\n';
        scenarioDataInsertionQuery += 'update tblScenariosRevisions set bLastRevision=0 where nScenarioID=' + billiScenarioId + '\n';
        scenarioDataInsertionQuery += 'insert into tblScenariosRevisions(nScenarioID,nRevisionTypeID,vcRevisionDesc,nUserID,bLastRevision) values(' +
            + billiScenarioId + ",13,'Copied scenario from baloo application',644,1)\n"; // jshint ignore:line

        for(var stepIndex=0, stepLength=stepsArray.length; stepIndex<stepLength; ++stepIndex) {
            var step = stepsArray[stepIndex],
                methodsArray = step.methods;

            scenarioDataInsertionQuery += 'insert into tblItems(nScenarioId, nItemNo, vcItemDesc) values(' +
                + billiScenarioId + ',' + (stepIndex+1) + ",'" + escapeSingleQuote(step.text) + "')\n" +  // jshint ignore:line
                'set @itemId = SCOPE_IDENTITY()\n';

            var methodTypeMap = {};
            for(var methodIndex=0, methodLength=methodsArray.length; methodIndex<methodLength; ++methodIndex) {
                var method = methodsArray[methodIndex],
                    actionsArray = method.actions,
                    primary = method.primary ? 1 : 0;

                var methodType = '';

                if(copyScenarioDocsFlag){
                    methodType = methodTypeEnum[method.type];
                } else{
                    methodType = checkMethodTypeMap(methodTypeMap, method.type, methodTypeEnum);
                }

                scenarioDataInsertionQuery += 'insert into tblAlternateMethods(nItemId, nMethodTypeId, nMethodPosition, bPrimaryMethod) values(' +
                    '@itemId,' + methodType + ',' + (methodIndex+1) + ',' + primary + ') ' +
                    'set @methodId = SCOPE_IDENTITY()\n';

                for(var actionIndex=0, actionLength=actionsArray.length; actionIndex<actionLength; ++actionIndex) {
                    var action = actionsArray[actionIndex];

                    scenarioDataInsertionQuery += 'insert into tblActions(nMethodId, nActionNo, vcStartTime, vcEndTime, vcActionDesc) values(' +
                        '@methodId,' + (actionIndex+1) + ",'"+action.startTime+"','"+action.endTime+"','" + escapeSingleQuote(action.text) + "')\n"; // jshint ignore:line
                }
            }
        }

        //Check if Scenario Docs needs to be copied
        if(copyScenarioDocsFlag) {
            //insert scenarioDocs
            scenarioDataInsertionQuery += 'INSERT INTO tblScenariosDocs( nDocTypeID, nScenarioID, vcDocName, dCreatedOn, dModifiedOn, binDocFile, dCompiledOn,vcChecksum) ' +
            'SELECT nDocTypeID,' + billiScenarioId + ', vcDocName, dCreatedOn, dModifiedOn, binDocFile, dCompiledOn, vcChecksum ' +
            'FROM tblScenariosDocs where nScenarioID=' + sourceBilliScenarioId + '\n';
        }

        //Check if Meta Data needs to be updated
        if(updateTaskMetaDataFlag) {
            //update Page Nos,  eTextURL, VideoURL
            scenarioDataInsertionQuery += 'update tblActivitiesSections ' +
            'set vcPageNos =\'' + escapeSingleQuote(balooScenariosDocuments[scenarioIndex].pageNo) + '\', vcETextURL = \'' + escapeSingleQuote(balooScenariosDocuments[scenarioIndex].eTextURL) + '\', vcVideoURL = \'' + escapeSingleQuote(balooScenariosDocuments[scenarioIndex].videoURL) + '\' ' +
            'where nActivityID in ' +
            '(select nActivityID from tblActivitiesScenarios where nScenarioID =' + billiScenarioId + ')\n';

            //update Scenario Title
            scenarioDataInsertionQuery += 'update tblActivities set vcActivityName =\'' + escapeSingleQuote(balooScenariosDocuments[scenarioIndex].title) +'\' , vcActivityDesc = \'Copied From: '+balooScenariosDocuments[scenarioIndex].friendlyId+'\''+
            'where nActivityID in ' +
            '(select nActivityID from  tblActivitiesScenarios where nScenarioID =' + billiScenarioId + ')\n';
        }
        scenarioDataInsertionQueryArray.push(scenarioDataInsertionQuery);
    }

    return scenarioDataInsertionQueryArray;
};

//replace the method types in insertion query script which were appended with the methodTypeDelimiter_sorry
//with the new method types Ids
var replaceNewMethodTypes = function(scenarioDataInsertionQuery, methodTypeEnum) {
    for(var index=0, length=newMethodTypes.length; index<length; ++index) {
        var methodType = newMethodTypes[index];

        //replace the method type string with the methodTypeId
        scenarioDataInsertionQuery = scenarioDataInsertionQuery.split(methodTypeDelimiter_sorry + methodType + methodTypeDelimiter_sorry).join(methodTypeEnum[methodType]);
    }

    return scenarioDataInsertionQuery;
};

//generate the insertion script for tblItems, tblAlternateMethods and tblActions table in billi database
//from balooScenariosDocuments from baloo database
exports.generate = function(billiScenarioIdArray, balooScenariosDocuments, methodTypeEnum, billiDAO, sqlRequestObject,updateTaskMetaDataFlag,copyScenarioDocsFlag) {
    var scenarioDataInsertionQueryArray = buildQueryArray(billiScenarioIdArray, balooScenariosDocuments, methodTypeEnum,updateTaskMetaDataFlag,copyScenarioDocsFlag);

    return new Promise(function(fulfill, reject) {
        //check if new method types exist
        if(newMethodTypes.length) {
            billiDAO.insertMethodTypes(sqlRequestObject, newMethodTypes, methodTypeEnum).then(function() {
                for(var index=0, length=scenarioDataInsertionQueryArray.length; index<length; ++index) {
                    var scenarioDataInsertionQuery = scenarioDataInsertionQueryArray[index];
                    scenarioDataInsertionQueryArray[index] = replaceNewMethodTypes(scenarioDataInsertionQuery, methodTypeEnum);
                }

                fulfill(scenarioDataInsertionQueryArray);
            }).catch(function(err) {
                reject(err);
            });
        } else {
            fulfill(scenarioDataInsertionQueryArray);
        }
    });
};
