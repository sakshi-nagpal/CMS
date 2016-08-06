'use strict';

var mongoose = require('mongoose'),
    billiConnection = require('../billi/billiConnection'),
    util = require('util'),
    Bluebird = require('bluebird'),
    Scenario = mongoose.model('Scenario');

/**
 * query to fetch audio timing from actions: actions.vcStartTime, actions.vcEndTime with positions within a scenario
 * @type {string}
 */
var timingQueryDraft = 'select items.nItemNo, methods.nMethodPosition, actions.nActionNo, actions.vcStartTime, actions.vcEndTime ' +
    'from tblActions actions ' +
    'join tblAlternateMethods methods on methods.nMethodID=actions.nMethodID ' +
    'join tblItems items on items.nItemID=methods.nItemID ' +
    'join tblActivitiesScenarios scenarios on scenarios.nScenarioID=items.nScenarioID ' +
    'join tblActivities activities on activities.nActivityID=scenarios.nActivityID ' +
    'join tblActivitiesSections sections on sections.nActivityID=activities.nActivityID ' +
    'join tblScenariosTypesEnum scenariotypes on scenariotypes.nScenarioTypeID = scenarios.nScenarioTypeID ' +
    'where methods.bPrimaryMethod=\'true\' and sections.vcTaskNo +\'.\'+ scenariotypes.vcScenarioTypeCode =';

exports.migrateScenarioAudioTiming = function (req, res, next) {
    var timingQuery,incorrectActionCounts= 0, counter= 0;
    billiConnection.startTransaction().then(function (sqlObject) {
        var request = sqlObject.sqlRequestObject;

        Scenario.find({}).select('friendlyId').exec().then(function (scenarios) {
            console.log('Number of scenarios: ', scenarios.length);
            var updateScenarioPromises = [];
            scenarios.forEach(function (scenario, scenarioIndex) {
                timingQuery = timingQueryDraft + '\'' + scenario.friendlyId + '\'';
                var actionCount = {}, recordsActionCount = {}, primaryMethodIndices = {};

                updateScenarioPromises.push(
                    request.query(timingQuery).then(function (records) { /* fetch records from billi */
                         if(!records.length){
                             counter++;
                             return;
                         }

                        Scenario.find({'friendlyId': scenario.friendlyId}).exec().then(function (scenarioDoc) {

                            /* prepare baloo action count map & primary method index map*/
                            scenarioDoc[0].steps.forEach(function (step, stepIndex) {
                                step.methods.forEach(function (method, methodIndex) {
                                    if (method.primary) {
                                        primaryMethodIndices[stepIndex] = methodIndex;
                                        actionCount[stepIndex]= method.actions.length; /* action count for each step's primary method */
                                    }
                                });
                            });

                            /* prepare billi action count map */
                            records.forEach(function (record, recordIndex) {
                                if(recordsActionCount.hasOwnProperty((record.nItemNo-1))){
                                    recordsActionCount[record.nItemNo-1]++;
                                }
                                else{
                                    recordsActionCount[record.nItemNo-1]=1;
                                }
                            });

                            /* -- validate scenario: primary methods' action count -- */
                            for(var key in recordsActionCount){
                                if(recordsActionCount[key]!==actionCount[key]){
                                    incorrectActionCounts++;
                                    counter++;
                                    console.log('Oops! Expected action count of', scenarioDoc[0].friendlyId, ' - Step:',key,'to be ', recordsActionCount[key], ', found ',actionCount[key] );
                                    return;
                                }
                            }

                            /* -- migrate --*/
                            var updateSet = {};
                            records.forEach(function (record, recordIndex) {
                                updateSet['steps.' + (record.nItemNo - 1) + '.methods.' + primaryMethodIndices[(record.nItemNo - 1)] + '.actions.' + (record.nActionNo - 1) + '.start'] = record.vcStartTime;
                                updateSet['steps.' + (record.nItemNo - 1) + '.methods.' + primaryMethodIndices[(record.nItemNo - 1)] + '.actions.' + (record.nActionNo - 1) + '.end'] = record.vcEndTime;
                            });
                            counter++;
                            console.log('Processed ',counter,' out of ',scenarios.length,' scenarios');
                            return Scenario.update({'friendlyId': scenarioDoc[0].friendlyId}, {$set: updateSet}).exec();
                        });

                    })
                );


            });

            Bluebird.all(updateScenarioPromises).then(function () {
                console.log('Migration of actions\' audio timings are successfully proccessed for ', updateScenarioPromises.length, ' out of ', scenarios.length, ' scenarios');
                if(incorrectActionCounts>0) console.log('Prevented migrating ',incorrectActionCounts,' scenarios with incorrect action count');
            }, function (err) {
                console.log('Error while migrating actions\' audio timings :', err);
                throw err;
            })
        });
    });
};
