'use strict';

var config = require('../../config/config');
var apis = [];

config.documentApis.forEach(function (documentApi) {
    apis[documentApi.categoryCode] = require(documentApi.module);
});

exports.getDocumentApi = function (categoryCode) {
    if (apis[categoryCode] != undefined) {
        return apis[categoryCode];
    }
    else {
        return apis['OTHER'];
    }
}
