'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    BaseSchema = require('./baseEntity.server.model'),
    extend = require('mongoose-schema-extend'),
    SkillIndexBaseSchema= require('./skillIndex.server.model');

/**
 * Skill Schema
 */

var SkillSchema = SkillIndexBaseSchema.extend({

    skillId:{
        type: String,
        trim:true,
        required: 'Skill ID cannot be blank',
        index:true
    },
    parentLabels:{
        type:[String],
        required: 'Parent labels cannot be blank'
    },
    mappedIds:{
        type:[String]
    },
    app: {
        type: [String]
    }

},{discriminatorKey : '_t'});

mongoose.model('Skill', SkillSchema);
