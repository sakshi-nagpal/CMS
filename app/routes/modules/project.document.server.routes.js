'use strict';

var document = require('../../controllers/project.document.server.controller'),
    multiparty = require('connect-multiparty'),
    multipartyMiddleware = multiparty();

module.exports = function (app) {
    app.route('/downloadFiles').post(document.getDocuments);
    app.route('/downloadFile/:file').get(document.getDocument);
    app.param('file', document.getFile);
};
