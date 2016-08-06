'use strict';

var document = require('../../controllers/document.server.controller'),
    user = require('../../controllers/users/users.authorization.server.controller.js'),
    multiparty = require('connect-multiparty'),
    multipartyMiddleware = multiparty();

module.exports = function (app) {
    app.route('/document/content/:content/scenario/:scenario/category/:category')
        .post(user.canUpload(), multipartyMiddleware, document.uploadDocument);
    app.route('/downloadFiles/scenario/:scenario').post(document.getDocuments);
    app.route('/downloadFile/scenario/:scenario/category/:category/file/:scenarioFile').get(document.getDocument);
    app.route('/document/scenario/:scenario/category/:category/file/:scenarioFileId')
        .delete(user.canUpload(), document.removeDocumentFromScenario);
    app.route('/downloadFile/scenario/:scenario/category/:category/file').get(document.getDocument);

    app.route('/downloadFiles/:zipId').get(document.getZip);

    app.param('content', document.getContentItem);
    app.param('scenario', document.getScenario);
    app.param('category', document.getCategory);
    app.param('scenarioFileId', document.fileIdParam);
    app.param('scenarioFile', document.getScenarioFile);
    app.param('zipId', document.resolveZipId);
};

