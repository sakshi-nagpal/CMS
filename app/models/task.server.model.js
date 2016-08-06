'use strict';

/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
    ContentSchema = require('./content.server.model.js'),
    ScenarioTypeObject = require('./scenarioTypeEnum.server.model'),
    extend = require('mongoose-schema-extend');


/**
 * Content Schema
 */

var TaskSchema = ContentSchema.extend({
    data: {
        eTextURL : {
            type: String,
            trim: true
        },
        videoURL : {
            type: String,
            trim: true
        },
        pageNo: {
            type: String
        },
        friendlyId: {
            type: String,
            trim: true
        },
        isActive: {
            type: Boolean,
            default: true

        }
    }

});

mongoose.model('Task', TaskSchema);

