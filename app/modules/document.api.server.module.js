'use strict';

var mongoose = require('mongoose'),
    path = require('path'),
    Q = require('q'),
    Scenario = mongoose.model('Scenario'),
    Content = mongoose.model('Content'),
    Category = mongoose.model('DocumentCategory'),
    BlueBird = require('bluebird'),
    fileApi = require('./file.save.api.server.module'),
    contentApi = require('../modules/content.api.server.module'),
    files = mongoose.model('files'),
    fs = require('fs'),
    config = require('../../config/config'),
    _ = require('lodash');

var generateFileName = function (scenario, categoryId, file) {
    var deferred = Q.defer();
    var newFileName;
    Category.findById(categoryId).exec().then(function (category) {
        if (category.notifications) {
            newFileName = scenario.friendlyId.replace(/\./g, '_');
            newFileName = newFileName + '_' + category.code + path.extname(file.name);
        }
        else {
            //newFileName = file.name.replace(/\ /g, '_');
            newFileName = file.name
        }
        deferred.resolve(newFileName);
    }, function (err) {
        deferred.reject(err);
    });
    return deferred.promise;
};

exports.updateScenarioDocument = function (content, scenario, category, file, callback) {
    content.getAncestors({type: 'cms_series'}, '_id', function (errParent, series) {
        if (errParent) {
            callback(errParent);
        }
        var fileLocation = series[0]._id + '/' + content.app + '/' + scenario._id;
        generateFileName(scenario, category, file).then(function (newName) {
            file.name = newName;
            var fileIndex = -1;
            var fileId;
            var isFileReplaced = false;
            for (var index = 0; index < scenario.documents.length; index++) {
                if (scenario.documents[index].category._id.toString() === category.toString()) {
                    fileIndex = index;
                    fileId = scenario.documents[index].file[0]._id;
                    break;
                }
            }

            if (fileIndex !== -1) {
                if (scenario.documents[fileIndex].category.allowedAmount === '1') {
                    scenario.documents[fileIndex].file = [];
                    isFileReplaced = true;
                    fileApi.removeFile(fileId, function (err) {
                        if (err) callback(err);
                    });
                }
            }
            else {
                fileIndex = scenario.documents.length;
                var document = {category: category, file: []};
                scenario.documents.push(document);
            }

            fileApi.save(file, fileLocation, function (err, fileDb) {
                if (err) return next(err);
                scenario.documents[fileIndex].file.push(fileDb);

                try {
                    updateScenario(scenario, fileIndex, fileDb, function () {
                        if (err) return callback(err);
                        callback(null, fileDb, isFileReplaced);         //UPDATE: updateScenario is updated with callback function
                    });
                }
                catch (err) {
                    callback(err);
                }
            });
        }).fail(function (err) {
            callback(err);
        });
    });
};

function updateScenario(scenario, fileIndex, fileDb, callback) {

    scenario.save(function (err, scenario) {
        if (err) {
            console.log(err);
            throw new err;
        }
        callback(scenario);                         //UPDATE: Scenario save is updated with callback function
    });
}

exports.removeDocumentFromScenario = function (scenario, fileId, callback) {
    for (var categoryIndex = 0; categoryIndex < scenario.documents.length; categoryIndex++) {
        for (var fileIndex = 0; fileIndex < scenario.documents[categoryIndex].file.length; fileIndex++) {
            if (scenario.documents[categoryIndex].file[fileIndex]._id.toString() === fileId.toString()) {
                scenario.documents[categoryIndex].file.splice(fileIndex, 1);
                if (scenario.documents[categoryIndex].file.length === 0) {
                    scenario.documents.splice(categoryIndex, 1);
                }
                break;
            }
        }
    }

    fileApi.removeFile(fileId, function (err) {
        if (err) return callback(err);
        scenario.save(function (err, docs) {
            if (err) return callback(err);

            callback(null);
        });
    });
};

exports.copyScenarioDocuments = function (scenario, sourceScenario) {
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
            if (sourceScenario.documents && sourceScenario.documents.length) {

                contentApi.seriesByElementId(scenario.taskId).then(function (series) {
                    var documentCategories = _.find(series.data.documentCategories, {type: 'scenario'}).categories;
                    Content.findById(scenario.taskId).exec().then(function (content) {
                        var copyDocumentObjects = [];
                        var category;

                        sourceScenario.documents.forEach(function (document) {
                            category = document.category;
                            if (documentCategories.indexOf(category.id) >= 0) {
                                if (document.file && document.file.length) {
                                    document.file.forEach(function (fileId) {
                                        copyDocumentObjects.push({              //Array of files in source scenario to be copied
                                            category: category._id,
                                            file: fileId.id
                                        });
                                    });
                                }
                            }
                        });

                        var result = Q();


                        copyDocumentObjects.forEach(function (doc, i) {
                            result = result.then(function () {
                                if (!i) {
                                    return copyFile(content, scenario, doc.category, doc.file);  //initially scenario fetch is not required
                                }
                                else {
                                    return Scenario.findById(scenario._id).populate('documents.category').populate('documents.file').exec().then(function (scenario) { //fetch scenario with updated documents
                                        return copyFile(content, scenario, doc.category, doc.file)
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

            } else fulfill(scenario);

        }, function (err) {
            throw err;
        });

    })
};

exports.removeAllDocumentsForScenario = function (scenario) {
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
    return BlueBird.all(deleteDocPromises);
}

function copyFile(content, scenario, category, fileId) {
    var updateScenarioDocument = BlueBird.promisify(exports.updateScenarioDocument);
    return files.findById(fileId).exec().then(function (file) {

        var fileObj = {
            path: config.fileSavePath + file.location + '/' + file.tmpName,  //file path belongs to the permanent location of file in source scenario
            name: file.originalName,
            type: file.fileType,
            size: file.fileSize
        };
        return updateScenarioDocument(content, scenario, category, fileObj);

    }, function (err) {
        throw err;
    });
}

