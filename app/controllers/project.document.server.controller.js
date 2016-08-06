'use strict';

var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    projectApi = require('../modules/project.document.api.module'),
    fileApi = require('../modules/file.save.api.server.module'),
    archiver = require('archiver'),
    async = require('async'),
    fs = require('fs'),
    config = require('../../config/config'),
    Project = mongoose.model('Project');

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

    async.whilst(
        function () {
            return count < fileIds.length;
        },
        function (callback) {
            fileApi.getFile(fileIds[count], function (err, fileObj) {
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


exports.getDocument = function (req, res, next) {
    if (req.file == undefined) {
        return next(new Error('File not found'));
    }
    else {
        res.setHeader('Content-disposition', 'attachment; filename="' + req.file.fileName + '"');
        res.setHeader('Content-type', req.file.fileType);
        res.write(req.file.file);
        res.end();
    }
};

exports.getFile = function (req, res, next, id) {
    fileApi.getFile(id, function (err, file) {
        if (err) return next(err);
        req.file = file;
        return next();
    });
};

