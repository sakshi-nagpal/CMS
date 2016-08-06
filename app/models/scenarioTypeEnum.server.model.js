'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose');

/**
 * Scenario Type Enum Schema
 */

var scenarioTypeObject = {
    code: {
        type: String,
        trim: true,
        default: 'T1',
        required: 'Scenario type cannot be blank'
    },
    index: {
        type: Number,
        trim: true,
        default : 0,
        required: 'Scenario Index cannot be blank'
    }
};

var ScenarioTypeEnumSchema = new mongoose.Schema({
    label: {
        type: String,
        trim: true,
        required: 'Scenario type Label cannot be blank'
    }
});


ScenarioTypeEnumSchema.add(scenarioTypeObject);
mongoose.model('scenarioTypeEnum', ScenarioTypeEnumSchema);

module.exports = scenarioTypeObject;
