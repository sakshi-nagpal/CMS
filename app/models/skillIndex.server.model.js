'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    BaseSchema = require('./baseEntity.server.model'),
    extend = require('mongoose-schema-extend'),
    tree = require('mongoose-path-tree');

/**
 * SkillIndex Base Schema
 */

var SkillIndexBaseSchema = BaseSchema.extend({
    title: {
        type: String,
        trim: true,
        required: 'Skill Index entity title cannot be blank'
    },
    type: {
        type: String,
        trim: true,
        required: 'Skill Index entity type cannot be blank'
    },
    product:{
        type: String,
        trim: true,
        required: 'Product cannot be blank'
    }
}, { collection : 'skillIndex' , discriminatorKey : '' });

SkillIndexBaseSchema.plugin(tree);

mongoose.model('SkillCategory', SkillIndexBaseSchema); //same model for Category and Sub-Category

module.exports = SkillIndexBaseSchema;
