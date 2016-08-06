'use strict';

var documentApi = require('../modules/document.api.server.module'),
    fileApi = require('../modules/file.save.api.server.module'),
    config = require('../../config/config');

exports.saveDocument = function (content, scenario, category, file, callback) {
    documentApi.updateScenarioDocument(content, scenario, category, file, function (err, fileDb, isFileReplaced) {
        if (err) {
            return callback(err);
        }

        callback(null, fileDb, isFileReplaced);
    });
}

exports.removeDocument = function (scenario, fileId, callback) {
    documentApi.removeDocumentFromScenario(scenario, fileId, function (err) {
        if (err) {
            return callback(err);
        }

        callback(null);
    });
}

exports.getDocument = function (scenario, fileId, callback) {
    fileApi.getFile(fileId, function (err, file) {
        if (err) return callback(err);

        callback(null, file);
    });
}
