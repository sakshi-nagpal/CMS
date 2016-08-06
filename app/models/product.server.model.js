'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    extend = require('mongoose-schema-extend'),
    BaseSchema = require('./baseEntity.server.model');

/**
 * ProductSchema Schema
 */
var ProductSchema = BaseSchema.extend({
    title: {
        type: String,
        trim: true,
        required: 'Product title cannot be blank'
    },
    applications: [{
        title: {
            type: String,
            trim: true,
            required: 'Series title cannot be blank'
        }
    }]
});

mongoose.model('Product', ProductSchema);
