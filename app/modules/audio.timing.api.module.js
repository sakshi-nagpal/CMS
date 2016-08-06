'use strict';

var documentApi = require('../modules/document.api.server.module'),
    Promise = require('promise'),
    mongoose = require('mongoose'),
    config = require('../../config/config'),
    Category = mongoose.model('DocumentCategory'),
    fs = require('fs'),
    baseDocumentApi = require('../modules/base.document.api.module'),
    fileApi = require('../modules/file.save.api.server.module'),
    audioXmlProcessor = require('../modules/audio.file.process.module');

exports.saveDocument = function (content, scenario, category, file, callback) {
    var promise = readTimingFile(file.path);

    promise.then(function (result) {

        audioXmlProcessor.validateAudioTimingFile(scenario, result).then(function (updatedScenario) {
            documentApi.updateScenarioDocument(content, scenario, category, file, function (err, fileDb, isFileReplaced) {
                if (err) {
                    return callback(err);
                }

                callback(null, fileDb, isFileReplaced);
            });
        }).catch(function (err) {
            return callback(err);
        })
    }).catch(function (err) {
        return callback(err);
    });
};

function readTimingFile(pathToFile) {
    var bufferString, bufferStringSplit;

    var promise = new Promise(function (resolve, reject) {
        fs.readFile(pathToFile, 'utf8', function (err, data) {
            if (err) reject(err);

            bufferString = data.toString();
            bufferStringSplit = bufferString.split(/\r?\n/);
            resolve(removeLastEmptyLine(bufferStringSplit));
        });
    });

    return promise;
}

function removeLastEmptyLine(splitString) {
    for (var index = splitString.length - 1; index >= 0; index--) {
        if (splitString[index] === '') {
            splitString.splice((splitString.length - 1), 1);
        }
        else {
            break;
        }
    }
    return splitString;
}

exports.removeDocument = function (scenario, fileId, callback) {
    documentApi.removeDocumentFromScenario(scenario, fileId, function (err) {

        if (err) return callback(err);

        callback(null);
    });
};

//TODO : Extend this method from base api
exports.getDocument = function (scenario, fileId, callback) {
    fileApi.getFile(fileId, function (err, file) {
        if (err) {
            console.log(err);
            return callback(err);
        }

        callback(null, file);
    });
};
