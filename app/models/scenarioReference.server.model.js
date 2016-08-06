'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose');

/**
 * Scenario Reference Schema
 */

var ScenarioReferenceSchema = new mongoose.Schema({
    reference_id: {
        type: String,
        trim: true,
        required: 'Scenario reference id cannot be blank'
    },
    reference_name: {
        type: String,
        trim: true,
        required: 'Scenario reference name cannot be blank'
    }
});

mongoose.model('ScenarioReference', ScenarioReferenceSchema);

