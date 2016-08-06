'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    extend = require('mongoose-schema-extend'),
    BaseSchema = require('./baseEntity.server.model');

/**
 * CatalogSchema Schema
 */
var CatalogSchema = BaseSchema.extend({
    title: {
        type: String,
        trim: true,
        required: 'Catalog title cannot be blank'
    },
    series: [{
        title: {
            type: String,
            trim: true,
            required: 'Series title cannot be blank'
        },
        thumbnail: {
            type: String,
            trim: true,
            default: ''
        },
        restrictedRoles: {
            type: [String]
        }
    }]
});

mongoose.model('Catalog', CatalogSchema);
