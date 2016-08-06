
'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
_ = require('lodash');

/**
 * Scenario Type Enum Schema
 */

var scenarioPhaseObject = {
    code: {
        type: String,
        trim: true
    }
};

var ScenarioPhaseEnumObject = {
    name: {
        type: String,
        trim: true,
        required: 'Scenario Phase name cannot be blank'
    },
    editable: {
        type: Boolean,
        default: false,
        trim: true
    },
    launchable: {
        type: Boolean,
        default: false,
        trim: true
    },
    usersRoles : {
        type: [String]
    }
};

var copyScenarioPhaseObject =_.clone(scenarioPhaseObject, true);

ScenarioPhaseEnumObject.code = copyScenarioPhaseObject.code;
ScenarioPhaseEnumObject.code.required = 'Scenario Phase code cannot be blank';
var ScenarioPhaseEnumSchema = new mongoose.Schema(ScenarioPhaseEnumObject);


mongoose.model('scenarioPhaseEnum', ScenarioPhaseEnumSchema);

module.exports = scenarioPhaseObject;
