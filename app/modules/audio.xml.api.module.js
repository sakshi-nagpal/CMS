'use strict';

var documentApi = require('../modules/document.api.server.module'),
    fileApi = require('../modules/file.save.api.server.module'),
    config = require('../../config/config'),
    audioXmlProcessor = require('../modules/audio.file.process.module');

exports.getDocument = function (scenario, fileId, callback) {
    var xmlString = audioXmlProcessor.getTimingXMLForScenario(scenario);

    var audioXmlCategoryCode = config.audioXMLCategory;

    var newFileName = scenario.friendlyId.replace(/\./g, '_');
    newFileName = newFileName + '_' + audioXmlCategoryCode + '.xml';

    var fileObj = {file: xmlString, fileName: newFileName, fileType: 'application/xml'}

    callback(null, fileObj);
};
