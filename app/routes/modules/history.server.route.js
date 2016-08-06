'use strict';

/**
 * Module dependencies.
 */
var history = require('../../controllers/history.server.controller');

module.exports = function(app) {
    // History Routes
    app.route('/history/entity/:id')
        .get(history.getEntityHistory);

    app.route('/history/entity/:entityId/revisions')
        .get(history.getEntityRevisions);

};
