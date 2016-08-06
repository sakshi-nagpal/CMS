
var mongoose = require('mongoose'),
    ScenarioPhaseObject = require('./scenarioPhaseEnum.server.model');

var historySchema = mongoose.Schema({
    entityId : {
        type: mongoose.Schema.Types.ObjectId,
        required : 'Entity Id can not be blank'
    },
    revisionId : {
        type: mongoose.Schema.Types.ObjectId,
        ref:'Revision',
        required : 'Revision Id can not be blank'
    },
    type :{
        type: String
    },
    version : {
        type: Number,
        required : 'Version can not be blank'
    },
    revisionTimestamp : {
        type: Date,
        default: Date.now
    },
    phase : ScenarioPhaseObject,
    updateType : {
        name: {
            type: String,
            trim: true,
            required: 'Update type name cannot be blank'
        },
        scope:{
            type: String,
            trim: true,
            required: 'Update type scope cannot be blank'
        }
    },
    publish:{
        type: Boolean
    },
    updatedBy: {
        _id: {
            type: mongoose.Schema.ObjectId,
            required: 'UserId cannot be blank',
            trim: true
        },
        name: {
            type: String,
            trim: true,
            required: 'Username cannot be blank'
        }
    }
});

historySchema.index({'entityId':1,'version':-1});

mongoose.model('History',historySchema);
