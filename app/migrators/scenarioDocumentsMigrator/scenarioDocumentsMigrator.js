'use strict';

var mongoose = require('mongoose'),
    billiConnection = require('../billi/billiConnection'),
    Scenario = mongoose.model('Scenario'),
    documentMigrateApi = require('../../modules/document.migrate.module.js'),
    util = require('util'),
    historyApi = require('../../modules/history.api.server.module.js'),
    Q = require('q');

/*
 Table fields: docTypeCode, docName, docBinary
 */

var queryScenarioDocuments = 'select tsde.vcDocCode code,' +                                          // doc code
    'tsd.vcDocName name, ' +                                                                          // doc name
    'tsd.binDocFile binary ' +                                                                        // doc binary
    'from tblActivities ta ' +
    'join tblActivitiesScenarios tasc on ta.nActivityID = tasc.nActivityID ' +
    'join tblActivitiesSections tas on tas.nActivityID = ta.nActivityID ' +
    'join tblScenariosDocs tsd on tsd.nScenarioID = tasc.nScenarioID ' +
    'join tblScenariosDocsEnum tsde on tsde.nDocTypeID = tsd.nDocTypeID ' +
    'join tblScenariosTypesEnum tste on tste.nScenarioTypeID = tasc.nScenarioTypeID ' +
    'where tas.vcTaskNo +\'.\'+ tste.vcScenarioTypeCode = ';

exports.migrateScenariosDocuments = function(req, res , next) {
    billiConnection.startTransaction().then(function(sqlObject) {

        var documentCounter = 0;
        var request = sqlObject.sqlRequestObject;
        var dbQuery;
        Scenario.find({}).select('_id').exec().then(function (scenarios) {
            console.log('number of scenarios: ', scenarios.length);           
            var result = Q();
            scenarios.forEach(function(scenario, i) {               //sync scenarios migration
                result = result.then(function() {
                    return Scenario.findById(scenario.id).exec().then(function(doc){
                        return migrateScenarioDocuments(doc).then(function(data) {
                            historyApi.pushScenarioToHistory(scenario.id,req.user,historyApi.UPDATE_TYPE_CONSTANTS.COPIED_FROM_BILLI, req.app.get('phases'));
                            console.log('no: ', i, ' friendlyId: ', doc.friendlyId, ' Document Count: ', documentCounter);
                            return data;
                        }, function(err) {
                            throw err;
                        });
                    }, function(err){
                        throw err;
                    });
                });
            });

            result.then(function() {
                console.log('scenario documents migration is successfully completed for documents: ', documentCounter);
            }, function(err) {
                throw err;
            });

            function migrateScenarioDocuments(scenario) {

                dbQuery = queryScenarioDocuments + '\'' + scenario.friendlyId + '\'';       //query scenario by friendlyId

                return request.query(util.format(dbQuery)).then(function (records) {

                    documentCounter += records.length;

                    return documentMigrateApi.saveScenarioDocuments(scenario, records);
                }, function(err) {
                    throw err;
                });
            }

        }, function(err) {
            throw err;
        });
    }, function(err) {
        throw err;
    });

};


