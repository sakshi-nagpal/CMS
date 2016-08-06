'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    BaseSchema = require('./baseEntity.server.model'),
    extend = require('mongoose-schema-extend'),
    tree = require('mongoose-path-tree');

/**
 * Content Schema
 */

var ContentSchema = BaseSchema.extend({
    title: {
        type: String,
        trim: true,
        required: 'Content title cannot be blank'
    },
    type: {
        type: String,
        trim: true,
        required: 'Content type cannot be blank'
    },
    app: {
        type: String,
        trim: true
    },
    serialNumber: {
        type: Number
    }
}, {collection: 'contents', discriminatorKey: ''});

ContentSchema.plugin(tree);

mongoose.model('Content', ContentSchema);

module.exports = ContentSchema;
