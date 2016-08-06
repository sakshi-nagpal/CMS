'use strict';

var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    fileApi = require('../modules/file.save.api.server.module'),
    documentApi = require('../modules/document.api.server.module'),
    documentFactory = require('../modules/document.factory.module'),
    Content = mongoose.model('Content'),
    Scenario = mongoose.model('Scenario'),
    Category = mongoose.model('DocumentCategory'),
    archiver = require('archiver'),
    config = require('../../config/config'),
    fs = require('fs'),
    async = require('async'),
    historyApi = require('../modules/history.api.server.module');

exports.getZip = function (req, res, next) {
    res.end();
};

exports.getDocument = function (req, res, next) {
    var documentSaveApi = documentFactory.getDocumentApi(req.category.code);
    var id;
    if (req.params.scenarioFile !== undefined) {
        id = req.params.scenarioFile;
    }
    documentSaveApi.getDocument(req.scenario, id, function (err, fileObj) {
        if (err) {
            return next(new Error('File not found'));
        }
        req.file = fileObj;
        res.setHeader('Content-disposition', 'attachment; filename="' + req.file.fileName + '"');
        res.setHeader('Content-type', req.file.fileType);
        res.write(req.file.file);
        res.end();
    });
};

exports.uploadDocument = function (req, res, next) {
    var scenario = req.scenario;
    var content = req.content;
    var category = req.category;
    var documentSaveApi = documentFactory.getDocumentApi(category.code);
    documentSaveApi.saveDocument(content, scenario, category._id, req.files.file, function (err, fileDb, isFileReplaced) {
        if (err) return next(err);

        fs.unlink(req.files.file.path);

        (function () {
            if (isFileReplaced) {
                return historyApi.pushScenarioToHistory(scenario._id, req.user, historyApi.UPDATE_TYPE_CONSTANTS.DOCUMENT_UPDATE, req.app.get('phases'));
            } else {
                return historyApi.pushScenarioToHistory(scenario._id, req.user, historyApi.UPDATE_TYPE_CONSTANTS.DOCUMENT_ADD, req.app.get('phases'));
            }
        })().then(function (scenario) {
            res.json(fileDb);
        }, function (err) {
            return next(err);
        });
    });
};

exports.getDocuments = function (req, res, next) {
    var fileIds = req.body;
    var fileName = new Date().getTime();
    var archive = archiver('zip');
    var output = fs.createWriteStream(config.fileSavePath + fileName + '.zip');
    var count = 0;

    archive.pipe(output);

    output.on('close', function () {
        if (archive._entries.length <= 0) {
            fs.unlink(config.fileSavePath + fileName + '.zip');
        }
        res.json({fileName: fileName});
        res.end();
    });

    output.on('error', function (err) {
        return next(err);
    });

    async.whilst(
        function () {
            return count < fileIds.length;
        },
        function (callback) {
            var documentFetchApi = documentFactory.getDocumentApi(fileIds[count].code);
            documentFetchApi.getDocument(req.scenario, fileIds[count].fileId, function (err, fileObj) {
                    if (err) {
                        return next(err);
                    }
                    if (fileObj != undefined) {
                        archive.append(fileObj.file, {name: fileObj.fileName});
                    }
                    count++;
                    callback();
                }
            );
        },
        function (err) {
            if (err) {
                return next(err);
            }
            archive.finalize();
        }
    );
};

exports.removeDocumentFromScenario = function (req, res, next) {
    var documentRemoveApi = documentFactory.getDocumentApi(req.category.code);
    documentRemoveApi.removeDocument(req.scenario, req.fileId, function (err) {
        if (err) {
            return next(err);
        }

        historyApi.pushScenarioToHistory(req.scenario._id, req.user, historyApi.UPDATE_TYPE_CONSTANTS.DOCUMENT_DELETE, req.app.get('phases')).then(function () {
            res.end();
        }, function (err) {
            next(err);
        });
    });
};

exports.getContentItem = function (req, res, next, id) {
    var query = Content.findById(id);
    query.exec(function (err, content) {
        if (err) {
            return next(err);
        }

        req.content = content;
        return next();
    });
};

exports.getScenario = function (req, res, next, id) {
    var query = Scenario.findById(id).populate('documents.category').populate('documents.file');
    query.exec(function (err, docs) {
        if (err) return next(err);

        req.scenario = docs;
        return next();
    });
};

exports.getCategory = function (req, res, next, id) {
    var query = Category.findById(id);
    query.exec(function (err, docs) {
        if (err) return next(err);

        req.category = docs;
        return next();
    });
};

exports.fileIdParam = function (req, res, next, id) {
    req.fileId = id;
    return next();
};

exports.resolveZipId = function (req, res, next, id) {
    if (!fs.existsSync(config.fileSavePath + id + '.zip')) {
        return next(new Error('No files found'));
    }
    var fileStream = fs.createReadStream(config.fileSavePath + id + '.zip');
    fileStream.pipe(res);
    var fileName = req.query.fileName.replace(/[.]/g, '_');
    res.setHeader('Content-disposition', 'attachment; filename=' + fileName.trim() + '.zip');
    res.setHeader('Content-type', 'application/zip');
    fileStream.on('close', function () {
        fs.unlink(config.fileSavePath + id + '.zip');
        return next();
    });
};

exports.getScenarioFile = function (req, res, next, id) {
    var documentSaveApi = documentFactory.getDocumentApi(req.category.code);
    documentSaveApi.getDocument(req.scenario, id, function (err, fileObj) {
        if (err) return next(err);
        req.file = fileObj;
        return next();
    });
};


