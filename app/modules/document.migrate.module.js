'use strict';

var mongoose = require('mongoose'),
    Q = require('q'),
    Scenario = mongoose.model('Scenario'),
    Content = mongoose.model('Content'),
    Category = mongoose.model('DocumentCategory'),
    BlueBird = require('bluebird'),
    documentApi = require('./document.api.server.module'),
    fileApi = require('./file.save.api.server.module'),
    fs = require('fs'),
    mime = require('mime-types'),
    _ = require('lodash');

var categoryMapper = {
    'Audio': 'AUDIO_FILE',
    'Dev': 'DEV_DOC',
    'End': 'END_DOC',
    'Start': 'START_DOC',
    'Timing': 'Additional_Assets',
    'Other': 'Additional_Assets'
};

function getCategoryId(code, categories) {
    var categoryCode = categoryMapper[code];
    var category = _.find(categories, {code: categoryCode});
    return category._id;
}

function fileSaver(record) {                                                                //save file in tmp location
    return new BlueBird(function (fulfill, reject) {

        var fileName = record.name;

        if ((record.code === 'Timing') && (fileName.charAt(0) === '.')) {
            fileName = 'Question_Hint_Timing' + fileName;                                       //doc of type timing
        }
        else if (fileName.charAt(0) === '.')                                                     //doc with no name
        {
            fileName = 'untitled' + fileName;
        }

        var fileExt = fileName.substring(fileName.lastIndexOf('.') - 1);
        var filePath = '/tmp/Baloo/';

        var writeStream = fs.createWriteStream(filePath + fileName);

        writeStream.on('finish', function () {
            var fileObj = {
                path: filePath + fileName,
                name: fileName,
                type: mime.lookup(fileExt),
                size: record.binary.length                                                          //byte size of file
            };

            fulfill(fileObj);
        });

        writeStream.write(record.binary);                                                        //binary.toString('utf-8') can also be used for proper text formatting
        writeStream.end();

    });
}

function readAndSaveFile(content, scenario, categories, record) {

    var updateScenarioDocument = BlueBird.promisify(documentApi.updateScenarioDocument);
    return fileSaver(record).then(function(fileObj ){
        if ((record.name.match(/devdoc|dev_doc|dev doc|sim_dev/ig)))       //dev docs are identified from doc type: others
        {
            record.code = 'Dev';
        }
        var categoryId = getCategoryId(record.code, categories);

        return updateScenarioDocument(content, scenario, categoryId, fileObj);

    });

    //var recordName = record.name.toLowerCase();
    //var isDevDoc = (recordName.indexOf('devdoc') >= 0) || (recordName.indexOf('dev_doc') >= 0) || (recordName.indexOf('dev doc') >= 0) || (recordName.indexOf('sim_dev') >= 0);


}

exports.saveScenarioDocuments = function (scenario, records) {
    return new BlueBird(function (fulfill, reject) {
        var deleteDocPromises = [];
        if (scenario.documents && scenario.documents.length) {
            var removeFile = BlueBird.promisify(fileApi.removeFile);

            scenario.documents.forEach(function (document) {
                if (document.file && document.file.length) {
                    document.file.forEach(function (fileId) {
                        deleteDocPromises.push(removeFile(fileId));
                    });
                }
            });
        }

        BlueBird.all(deleteDocPromises).then(function () {   //documents in destination scenario are successfully removed
            scenario.documents = [];
            if (records && records.length) {

                Content.findById(scenario.taskId).exec().then(function (content) {

                    Category.find({}).exec().then(function (categories) {

                        var result = Q();

                        records.forEach(function (record, i) {

                            result = result.then(function () {
                                if (!i) {
                                    return readAndSaveFile(content, scenario, categories, record);  //initially scenario fetch is not required
                                }
                                else {
                                    return Scenario.findById(scenario._id).populate('documents.category').populate('documents.file').exec().then(function (scenario) { //fetch scenario with updated documents
                                        return readAndSaveFile(content, scenario, categories, record);
                                    }, function (err) {
                                        throw err;
                                    });
                                }
                            });

                        });

                        result.then(function () {
                            fulfill('success ');   //files are successfully copied in the scenario
                        });
                    }, function (err) {
                        throw err;
                    });
                }, function (err) {
                    throw err;
                });


            } else {
                fulfill('success');         //no records to be copied
            }

        }, function (err) {
            throw err;
        });

    });
};

