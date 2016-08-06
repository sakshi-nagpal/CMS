'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    Product = mongoose.model('Product');

/**
 * List of Products
 */
exports.list = function(req, res,next) {
    Product.find({},'title thumbnail').exec().then(function(product) {
            res.json(product);
    }, function(err) {
        next(new errorHandler.error.ProcessingError(errorHandler.getErrorMessage(err)));
    });
};
