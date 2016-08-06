'use strict';

/**
 * Module dependencies.
 */
var admin = require('../../controllers/admin.server.controller'),
    user = require('../../controllers/users/users.authorization.server.controller');

module.exports = function (app) {
    // Upload Routes
    app.route('/admin/content/export')
        .get(user.can('administration'), admin.contentExport);
    app.route('/admin/content/import')
        .get(user.can('administration'), admin.contentImport);
};
