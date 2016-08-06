'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    BaseSchema = require('./baseEntity.server.model'),
    ScenarioTypeObject = require('./scenarioTypeEnum.server.model'),
    MethodTypeObject = require('./methodTypeEnum.server.model'),
    ScenarioPhaseObject = require('./scenarioPhaseEnum.server.model'),
    extend = require('mongoose-schema-extend');


var ActionSchema = new mongoose.Schema({
    text: {
        type: String,
        trim: true
    },
    start:{
        type: String,
        default: '00:00:000'
    },
    end: {
        type: String,
        default: '00:00:000'
    }
});

var MethodSchema = new mongoose.Schema({
    type: MethodTypeObject.name,
    primary: {
        type: Boolean,
        default: false,
        trim: true
    },
    actions: [ActionSchema]
});

var ExtendedMethodSchema = MethodSchema.extend({
    status: {
        type: String,
        trim: true,
        default: 'default'
    }
});

var Threads = new mongoose.Schema({
    sequence: Number,
    thread: {type: mongoose.Schema.Types.ObjectId, ref: 'threads'}
});

var StepSchema = new mongoose.Schema({
    text: {
        type: String,
        trim: true
    },
    methods: [ExtendedMethodSchema],
    skills: [
        {
            _id: {
                type: mongoose.Schema.Types.ObjectId,
                trim: true,
                ref: 'Skill'
            },
            skillId: {
                type: String,
                trim: true
            },
            title: {
                type: String,
                trim: true
            },
            app: {
                type: [String]
            }
        }
    ],
    copiedFrom: {
        label: {
            type: String,
            trim: true
        },
        scenarioId: {
            type: mongoose.Schema.Types.ObjectId,
            trim: true,
            ref: 'Scenario'
        },
        stepId: {
            type: mongoose.Schema.Types.ObjectId,
            trim: true,
            ref: 'Step'
        }
    },
    threads: [Threads]
});

var DocumentSchema = mongoose.Schema({
    category: {type: mongoose.Schema.Types.ObjectId, ref: 'DocumentCategory'},
    file: [{type: mongoose.Schema.Types.ObjectId, ref: 'files'}]
}, {_id: false});

var ScenarioSchema = BaseSchema.extend({
    createdBy: {
        _id: {
            type: mongoose.Schema.ObjectId,
            required: 'createdBy cannot be blank',
            trim: true
        },
        name: {
            type: String,
            trim: true,
            required: 'createdBy cannot be blank'
        }
    },
    updatedBy: {
        _id: {
            type: mongoose.Schema.ObjectId,
            required: 'updatedBy cannot be blank',
            trim: true
        },
        name: {
            type: String,
            required: 'updatedBy cannot be blank',
            trim: true
        }
    },
    taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    },
    friendlyId: {
        type: String,
        trim: true
    },
    title: {
        type: String,
        trim: true
    },
    type: ScenarioTypeObject,

    phase: ScenarioPhaseObject,

    documents: [DocumentSchema],
    version: {
        type: String,
        trim: true
    },
    index: {
        type: Number
    },
    levelOfRevision: {
        type: Number,
        default: -1
    },
    difficulty: {
        type: Number,
        default: -1
    },
    steps: [StepSchema],
    threads: [Threads],
    isActive : {
            type: Boolean,
            default: true
        }
});

ScenarioSchema.index({'steps.skills.skillId': 1}); // index for search by SkillId from the task
ScenarioSchema.index({'steps.skills.app': 1}); // index for search by app from the task

module.exports = {methodSchema: MethodSchema};
mongoose.model('Scenario', ScenarioSchema);
