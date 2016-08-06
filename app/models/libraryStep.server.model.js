'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    BaseSchema = require('./baseEntity.server.model'),
    Scenario = require('./scenario.server.model'),
    extend = require('mongoose-schema-extend');

/**
 * Library Step Base Schema
 */
var libraryStepSchema = BaseSchema.extend({
    name: {
        type: String,
        trim: true,
        required: 'Library Step entity name cannot be blank',
        index: { unique: true }
    },
    text: {
        type: String,
        trim: true
    },
    product: {
        type: String
    },
    app: {
        type: [String]
    },
    status: {
        type: String,
        trim: true,
        default : 'Unqualified'
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: 'UserId cannot be blank',
        trim: true
    },
    updatedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: 'UserId cannot be blank',
        trim: true
    },
    methods:[Scenario.methodSchema],
    skills : [
        {
            _id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'skillIndex'
            },
            skillId:{
                type: String,
                trim: true
            },
            title:{
                type: String,
                trim: true
            },
            app:{
                type: [String]
            }
        }
    ],

    mappedSteps: [
        {
            scenarioId : {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Scenario'
            },
            stepId : {
                type: mongoose.Schema.Types.ObjectId
            }
        }
    ]
},{ collection : 'librarysteps' });

mongoose.model('LibraryStep', libraryStepSchema);
libraryStepSchema.path('name').validate(uniqueFieldInsensitive('LibraryStep', 'name' ), 'unique' );

function uniqueFieldInsensitive ( modelName, field ){
    return function(val, cb){
        if( val && val.length ){ // if string not empty/null

            var query = mongoose.models[modelName]
                .where( field, new RegExp('^'+val+'$', 'i') ); // lookup the collection for somthing that looks like this field

            if( !this.isNew ){ // if update, make sure we are not colliding with itself
                query = query.where('_id').ne(this._id)
            }

            query.count(function(err,n){
                // false when validation fails
                cb( n < 1 )
            })
        } else { // raise error of unique if empty // may be confusing, but is rightful
            cb( false )
        }
    }
}
