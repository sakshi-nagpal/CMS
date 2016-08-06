'use strict';

/**
 * Module dependencies.
 */
var catalog = require('../../controllers/catalog.server.controller.js');

module.exports = function(app) {
    // Catalog Routes
    app.route('/catalog')
        .get(catalog.list);
    app.route('/catalog/:catalogId')
        .get(catalog.read);

    // Finish by binding the officeVersion middleware
    app.param('catalogId', catalog.catalogByID);
};
