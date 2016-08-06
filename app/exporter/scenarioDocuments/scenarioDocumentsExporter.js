'use strict';

var mongoose = require('mongoose'),
    Scenario = mongoose.model('Scenario'),
    Promise = require('promise'),
    XLSXWriter = require('xlsx-writestream'),
    rowCount = 0,
    exportedData = [];
   var writer, workbook;

var columns = ['SNO.','Scenario Id','Scenario FriendlyId', 'Document Type', 'File Name','File TmpName', 'File Size'];



var getAllBalooScenarios = function () {
    console.log(2345);

    return Scenario.find({}).select('_id').exec();

};

var exportScenarioFileMetaData = function (scenarioObj) {

    return Scenario.findById(scenarioObj.id).populate('documents.category documents.file').exec().then(function(scenario){

    if (scenario.documents) {
        scenario.documents.forEach(function (doc) {
            doc.file.forEach(function (file) {
                ++rowCount;
                var row ={};


                var column = 0;
                row[columns[column++]] = rowCount;
                row[columns[column++]] = scenario._id.toString();
                row[columns[column++]] = scenario.friendlyId;
                row[columns[column++]] = doc.category.displayName;
                row[columns[column++]] =  file.originalName ;
                row[columns[column++]] =  file.tmpName;
                row[columns[column++]] =   file.fileSize;

                exportedData.push(row);

            });
        });
    }

    });
};

exports.getScenarioFileData = function (req, res) {
    exportedData = [];

    res.writeHead(200, [['Content-Type',  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
        ['Content-Disposition', 'attachment; filename=Pathways.xlsx']]);
    workbook = {};
    workbook.SheetNames = ['content'];
    writer = new XLSXWriter(workbook, { cellStyles :true, cellHTML:false}/* options */);
    writer.getReadStream().pipe(res);

    getAllBalooScenarios().then(function (scenarios) {
        console.log(scenarios.length);
        var promiseArray = [];
        scenarios.forEach(function(scenario){
            promiseArray.push(exportScenarioFileMetaData(scenario));
        });

        Promise.all(promiseArray).then(function (result) {
            console.log(1234);
            writer.addRows(exportedData);
            writer.finalize();
            //res.send({fileData : exportedData});
        });

    },function(err){
        console.log(err);
    });
};

