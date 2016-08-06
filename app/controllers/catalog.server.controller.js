'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    Catalog = mongoose.model('Catalog'),
    _ = require('lodash');

/**
 * List of catalogs
 */
exports.list = function(req, res,next) {
    Catalog.find().exec().then(function(catalogs) {
            var filteredCatalogs = catalogs.filter(function(catalog){
                var filteredSeries = catalog.series.filter(function(currentSeries){
                    if(currentSeries.restrictedRoles && _.intersection(req.user.roles, currentSeries.restrictedRoles).length){
                        return false;
                    }else{
                        return true;
                    }
                });
                if(filteredSeries.length){
                    catalog.series = filteredSeries;
                    return true;
                }else{
                    return false;
                }
            });
            res.json(filteredCatalogs);
    }, function(err) {
        next(new errorHandler.error.ProcessingError(errorHandler.getErrorMessage(err)));
    });
};

exports.catalogByID = function(req, res, next, id) {

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new errorHandler.error.MalformedRequest('Catalog is invalid');
    }

    Catalog.findById(id).exec().then(function(catalog) {
        if (!catalog) {
            throw new errorHandler.error.NotFound('Catalog not found');
        }
        req.catalog = catalog;
        next();
    }).then(null,function(err){
        next(err);
    });
};

exports.read = function(req, res) {
    res.json(req.catalog);
};

/*exports.create = function(req,res,next) {
    var catalog = new Catalog(req.body);

    catalog.save().then(function() {
            res.json(catalog);
    }, function(err) {
        var newErr = new errorHandler.error.MalformedRequest(errorHandler.getErrorMessage(err));
        next(newErr);
    });
};*/
