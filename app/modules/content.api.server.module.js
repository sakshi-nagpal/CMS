'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('../controllers/errors.server.controller'),
    Content = mongoose.model('Content'),
    ObjectId = mongoose.Types.ObjectId,
    DocumentCategory = mongoose.model('DocumentCategory'),
    Series = mongoose.model('Series'),
    Promise = require('promise'),
    Project = mongoose.model('Project'),
    _ = require('lodash');

exports.seriesByElementId = function (elementId, options) {
   return  Content.findById(elementId).exec().then(function(task) {
        if(options && options.requiredDocs) {
           return Series.findById(ObjectId(task.path.split('#')[0])).populate({path: 'data.documentCategories.categories', match : {required : true}}).exec().then(function(seriesPopulated) {
               return seriesPopulated;
            }, function(err) {
                throw err;
            });
        }  else {
            return Series.findById(ObjectId(task.path.split('#')[0])).exec().then(function(series) {
                return series;
            }, function(err) {
                throw err;
            });
        }
    }, function(err) {
        throw err;
    });
};

exports.projectByTaskId = function (taskId, options) {
    return  Content.findById(taskId).exec().then(function(task) {
        if(options && options.requiredScenarioRef) {
            return Project.findById(ObjectId(task.parent)).populate('data.content_ref.scenario_ref').exec().then(function(projectPopulated) {
                return projectPopulated;
            }, function(err) {
                throw err;
            });
        }  else {
            return Project.findById(ObjectId(task.parent)).exec().then(function(project) {
                return project;
            }, function(err) {
                throw err;
            });
        }
    }, function(err) {
        throw err;
    });
};
