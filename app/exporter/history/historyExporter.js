'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    historyReportCollectionName = 'historyreports',
    errorHandler = require('../../controllers/errors.server.controller'),
    XLSXWriter = require('../../util/XLSXWriterExtended'),

    Scenario = mongoose.model('Scenario'),
    History = mongoose.model('History'),
    _ = require('lodash'),

    HistoryReport = mongoose.model('HistoryReport', new Schema({},{strict:false},{ collection : historyReportCollectionName }));


exports.getHistoryReportForType = function(req, res, next){

    var entityType = req.params.type;
    var startDate = req.query.startDate;
    var endDate = req.query.endDate;

    if(!entityType || !startDate || !endDate)
        next(new errorHandler.error.MalformedRequest(errorHandler.getErrorMessage(err)));

    var writer = XLSXWriter.writeSheet(res, 'HistoryReport');

    var obj;
    var rowObj ;
    var populateSheet = function(data){

        if(data.length === 0){
            writer.addRow({'Task Id':'','Update Types':'','Last Updated Time':''});
        } else {
            data.forEach(function(row, index){
                rowObj = row._doc.value;
                obj = {};
                //obj['Entity Id'] = rowObj.entityId.toString();
                obj['Task Id'] = rowObj.friendlyId ? rowObj.friendlyId.toString() : '';
                obj['Update Types'] = rowObj.updateType;
                obj['Last Updated Date'] = rowObj.revisionTimestamp.toDateString();
                writer.addRow(obj);

            });
        }
        writer.finalize();
    }

    var historyMap = function () {
        var values = {
            updateType: this.updateType.name+'(v.'+this.version+')',
            version: this.version,
            revisionTimestamp: this.revisionTimestamp,
            entityId:this.entityId
        }
        emit(this.entityId, values);
    };
    var scenarioMap = function(){
        emit(this._id,{friendlyId: this.friendlyId});
    };
    var reduce = function(key, values){
        if(!updateTypes){
            var updateTypes = '';
        }
        if(!friendlyId){
            var friendlyId = '';
        }
        if(!application){
            var application = '';
        }
        if(values[0].revisionTimestamp != 'undefined'){
            var revisionTimestamp = values[values.length-1].revisionTimestamp;
        }
        values.forEach(function(value){
            if(value.updateType)
                updateTypes += value.updateType + ',';
            if(value.friendlyId)
                friendlyId = value.friendlyId;
            if(value.friendlyId)
                friendlyId = value.friendlyId;
        });
        return {updateType:updateTypes, entityId:key, friendlyId:friendlyId, revisionTimestamp: revisionTimestamp};
    };

    /* map reduce does not support exec with current version of mongoose */
    HistoryReport.find({}).remove().exec().then(function(err,data){
        History.mapReduce({map:historyMap, reduce: reduce,query:{type:'Scenario',  revisionTimestamp: {$gte: startDate, $lt: endDate}},
            out:{'reduce': historyReportCollectionName}, sort:{revisionTimestamp: -1}}, function(err, data){
            Scenario.mapReduce({map:scenarioMap, reduce:reduce, out:{'reduce': historyReportCollectionName}}, function(err, data){
                HistoryReport.find({'value.updateType':{'$exists':true}}).exec().then(function(data){
                    populateSheet(data);
                });
            });
        });
    }).then(null, function(err){
        next(new errorHandler.error.ProcessingError(errorHandler.getErrorMessage(err)));
    });

};
