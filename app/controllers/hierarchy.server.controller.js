'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    Hierarchy = mongoose.model('hierarchy'),
    logger = require('../../config/loggers/appLogger');

/**
 * Get Hierarchy by Series Id
 */

exports.getHierarchyBySeriesId = function(req, res) {

    logger.debug('incoming series id: '+req.param('seriesId'));

    Hierarchy.findById(req.param('seriesId')).exec(function(err, hierarchy) {
        if (err) {
            logger.debug('error'+req.param('seriesId'));
            return res.status(400).send({
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            logger.debug('success'+req.param('seriesId'));
            res.json(hierarchy);
        }
    });
};

