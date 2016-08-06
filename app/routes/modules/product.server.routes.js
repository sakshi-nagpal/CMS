'use strict';

/**
 * Module dependencies.
 */
var product = require('../../controllers/product.server.controller.js');

module.exports = function(app) {
    // Catalog Routes
    app.route('/product')
        .get(product.list);

    // Finish by binding the officeVersion middleware
    //app.param('productId', product.productByID);
};
