'use strict';

var mongoose = require('mongoose'),
    billiConnection = require('../billi/billiConnection'),
    fs = require('fs'),
    Project = mongoose.model('Project'),
    projectApi = require('../../modules/project.document.api.module'),
    fileApi = require('../../modules/file.save.api.server.module'),
    Category = mongoose.model('DocumentCategory'),
    Task = mongoose.model('Task'),
    util = require('util'),
    mime = require('mime'),
    Q = require('q');

var filePath = '/tmp/Baloo/';

var scenarioTypes = [];
scenarioTypes["T1"] = {code: "T1", index: 1};
scenarioTypes["A1"] = {code: "A1", index: 2};
scenarioTypes["A2"] = {code: "A2", index: 3};

var docTypes = [];
docTypes["Start"] = {code: "START_DOC", category: {}};
docTypes["End"] = {code: "END_DOC", category: {}};
docTypes["cab"] = {code: "PROJECT_BMP", category: {}};
docTypes["Dev"] = {code: "DEV_DOC", category: {}};

Object.keys(docTypes).forEach(function (key) {
    Category.find({code: docTypes[key].code}).exec(function (err, category) {
        docTypes[key].category = category[0];
    })
});

var queryProjectDocuments = 'SELECT ProjectsDocs.nDocID AS ID, ' +
    'ProjectsDocs.binDocFile AS Document, ' +
    'DocTypeEnum.vcDocCode AS DocCode, ' +
    'ScenarioTypes.vcScenarioTypeCode AS ScenarioType, ' +
    'ProjectsDocs.vcDocName AS DocType ' +
    'FROM dbo.tblProjectsDocs AS ProjectsDocs ' +
    'INNER JOIN dbo.tblProjectsDocsEnum AS DocTypeEnum ' +
    'ON ProjectsDocs.nDocTypeID=DocTypeEnum.nDocTypeID ' +
    'INNER JOIN dbo.tblScenariosTypesEnum AS ScenarioTypes ' +
    'ON ProjectsDocs.nScenarioTypeID=ScenarioTypes.nScenarioTypeID ' +
    'INNER JOIN dbo.tblProjects AS Projects ' +
    'ON Projects.nProjectID = ProjectsDocs.nProjectID ' +
    'INNER JOIN dbo.tblChapters AS Chapters ' +
    'ON Projects.nChapterID = Chapters.nChapterID ' +
    'INNER JOIN dbo.tblChaptersSections AS ChapterSections ' +
    'ON Chapters.nChapterID = ChapterSections.nChapterID ' +
    'INNER JOIN dbo.tblSections AS Sections ' +
    'ON ChapterSections.nSectionID = Sections.nSectionID ' +
    'INNER JOIN dbo.tblBooks AS Books ' +
    'ON Sections.nBookID = Books.nBookID ' +
    'INNER JOIN dbo.tblBooksSeries AS BookSeries ' +
    'ON Books.nSeriesID = BookSeries.nSeriesID ' +
    'WHERE Projects.vcProjectName = \'PROJECT_TITLE\' ' +
    'AND Chapters.vcChapterName = \'CHAPTER_TITLE\' ' +
    'AND Sections.vcSectionName = \'SECTION_TITLE\' ' +
    'AND BookSeries.vcSeriesName = \'SERIES_TITLE\'';


exports.migrateProjectDocuments = function (project, callback) {

    var documentsTransferred = 0;

    billiConnection.startTransaction().then(function (sqlObject) {

        console.log("SQL connection opened");

        project.getAncestors({}, 'title', {}, function (err, ancestors) {
            if (err) {
                console.log(err);
                return callback(err);
            }

            var request = sqlObject.sqlRequestObject;
            var dbQuery = queryProjectDocuments.replace('PROJECT_TITLE', project.title).replace('CHAPTER_TITLE', ancestors[2].title)
                .replace('SECTION_TITLE', ancestors[1].title)
                .replace('SERIES_TITLE', ancestors[0].title);

            var scenarioType, category;

            removeExistingDocuments(project).then(function () {
                project.data.documents = [];
                project.save(function (err, docs) {
                    if (err) {
                        console.log(err);
                        return callback(err);
                    }
                });
                return request.query(util.format(dbQuery));
            }, function (err) {
                if (err) {
                    console.log(err);
                    return callback(err);
                }
            }).then(function (records) {
                var promise_chain = Q.fcall(function () {
                });
                console.log("Number of Documents : " + records.length);
                records.forEach(function (record) {
                    promise_chain = promise_chain.then(function () {
                        return saveFile(record, project);
                    }, function (err) {
                        if (err) {
                            console.log(err);
                            return callback(err);
                        }
                    }).then(function (fileObj) {
                        scenarioType = scenarioTypes[record.ScenarioType];
                        category = docTypes[record.DocCode].category;
                        documentsTransferred += 1;
                        return updateProjectDocument(project, scenarioType, category._id, fileObj);
                    }, function (err) {
                        return callback(err);
                    });
                });

                promise_chain.then(function () {
                    sqlObject.transaction.commit(function (err) {
                        if (err) {
                            console.log(err);
                            return callback(err);
                        }

                        console.log("Number of Documents Transferred : " + documentsTransferred);
                        billiConnection.closeConnection();
                        callback(null);
                    });
                }, function (err) {
                    return callback(err);
                });

            }, function (err) {
                console.log(err);
                return callback(err);
            });
        });
    }, function (err) {
        console.log(err);
        return callback(err);
    });
};

function removeExistingDocuments(project) {
    var promise_chain = Q.fcall(function () {
    });
    if (project.data.documents && project.data.documents.length > 0) {
        project.data.documents.forEach(function (documentData) {
                documentData.documents.forEach(function (document) {
                    document.files.forEach(function (file) {
                        promise_chain = promise_chain.then(function () {
                            return removeFile(file._id);
                        }).fail(function (err) {
                            console.log(err);
                            throw new Error(err);
                        });
                    })
                })
            }
        )
    }

    return promise_chain;
}

function removeFile(fileId) {
    var deferred = Q.defer();
    fileApi.removeFile(fileId, function (err) {
        if (err) {
            console.log(err);
            deferred.reject(err);
        }
        deferred.resolve();
    })
    return deferred.promise;
}

function saveFile(record, project) {

    var deferred = Q.defer();
    getDocumentName(record, project).then(function (fileName) {
        console.log(fileName);
        var fileExt = record.DocType.split('.')[1];
        var writeStream = fs.createWriteStream(filePath + fileName);

        writeStream.on('error', function (err) {
            deferred.reject(err);
        });

        writeStream.on('finish', function () {
            var fileObj = {
                path: filePath + fileName,
                name: fileName + '.' + fileExt,
                type: mime.lookup(fileExt),
                size: record.Document.length
            };

            deferred.resolve(fileObj);
        });

        writeStream.write(record.Document);
        writeStream.end();
    }, function (err) {
        console.log(err);
        deferred.reject(err);
    });


    return deferred.promise;
}


function getDocumentName(record, project) {
    var deferred = Q.defer();
    project.getChildren({type: "cms_task"}, true, function (err, tasks) {
        if (err) {
            console.log(err);
            deferred.reject(err);
        }

        Task.findById(tasks[0]._id).exec(function (err, task) {
            if (err) {
                console.log(err);
                deferred.reject(err);
            }

            var lastIndex = task.data.friendlyId.toString().lastIndexOf('.');
            var taskFriendlyId = task.data.friendlyId.toString().substring(0, lastIndex);
            var scenarioType = scenarioTypes[record.ScenarioType];
            var category = docTypes[record.DocCode].category;
            var fileName = taskFriendlyId.replace(/\./g, '_') + '_' + scenarioType.code + '_' + category.code;

            deferred.resolve(fileName);
        });
    });

    return deferred.promise;
}

function updateProjectDocument(project, scnearioType, categoryId, fileObj) {
    var deferred = Q.defer();
    projectApi.updateProjectDocument(project, scnearioType, categoryId, fileObj, function (err, projectDocs) {
        if (err) {
            console.log(err);
            deferred.reject(err);
        }

        fs.unlink(fileObj.path);
        deferred.resolve(fileObj);
    });

    return deferred.promise;
}

