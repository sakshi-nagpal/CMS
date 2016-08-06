'use strict';

var mongoose = require('mongoose'),
    files = mongoose.model('files'),
    fileSaver = require('./file.save.server.module');

exports.save = function (file, fileLocation, callback) {
    var fileObj = {
        "_id": mongoose.Types.ObjectId(),
        "originalName": file.name,
        "fileType": file.type,
        "fileSize": file.size,
        "timeStamp": new Date()
    };

    fileSaver.saveFile(file, fileLocation, function (err, fileSave) {
        if (err) return callback(err);

        fileObj.tmpName = fileSave.fileName;
        fileObj.location = fileSave.filePath;
        var fileDb = new files(fileObj);
        fileDb.save(function (err, fileDb) {
            if (err) return callback(err);
            callback(null, fileDb);
        });
    });
};


exports.getFile = function (fileId, callback) {
    files.findById(fileId, function (err, fileDb) {
        if (err) return callback(err);

        if (fileDb === null) {
            return callback(new Error('File not found'));
        }

        fileSaver.getFile(fileDb, function (err, file) {
            if (err) return callback(err);

            var fileObj = {"file": file, "fileName": fileDb.originalName, "fileType": fileDb.fileType};
            callback(null, fileObj);
        });
    });
};

exports.removeFile = function (fileId, callback) {
    files.findByIdAndRemove(fileId, function (err, fileDb) {
        if (err) return callback(err);
        if (fileDb !== null) {
            fileSaver.removeFile(fileDb, function (err) {
                if (err) return callback(err);

                callback(null);
            });
        }
        else {
            callback(null);
        }
    });
};
