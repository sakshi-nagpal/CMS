'use strict';


/**
 * Module dependencies.
 */

var mongoose = require('mongoose'),
    ContentSchema = require('./content.server.model.js'),
    ScenarioTypeObject = require('./scenarioTypeEnum.server.model'),
    DocumentCategoryObject = require('./document.category.server.model'),
    extend = require('mongoose-schema-extend');


/**
 * Content Schema
 */

var SeriesSchema = ContentSchema.extend({
            data: {
                taxonomy: [{
                    name: {
                        type: String,
                        trim: true,
                        required: 'taxonomy name cannot be blank'
                    },
                    view: {
                        type: String,
                        trim: true,
                        required: 'view cannot be blank'
                    },
                    index: {
                        type: String,
                        trim: true,
                        required: 'index cannot be blank'
                    },
                    type: {
                        type: String,
                        trim: true,
                        required: 'type cannot be blank'
                    }
                }],
                scenarioTypes: [ScenarioTypeObject],
                documentCategories: [{
                    type: {type: String}, categories: [{type: mongoose.Schema.Types.ObjectId, ref: 'DocumentCategory'}]
                }],
                icon: {
                    type: String,
                    trim: true
                }
            }
        },
        {
            discriminatorKey: '_t'
        }
    )
    ;

mongoose.model('Series', SeriesSchema);






