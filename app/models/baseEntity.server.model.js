'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    util = require('util'),
    //transactionSupport = require('../util/transaction.model.support'),
    Schema = mongoose.Schema;

var BaseSchema = new Schema({

    createdTimestamp: {
        type: Date,
        default: Date.now
    },
    updatedTimestamp: {
        type: Date,
        default: Date.now
    },
    documentVersion: {
        type: Number,
        default: 0
    }
});

function updateDateAndVersion(){
    this.update({},{
        $set: {
            updatedTimestamp: Date.now()
        },
        $inc :{
            documentVersion : 1
        }
    });
}

//update updatedTimestamp and documentVersion on each update
BaseSchema.pre('update', function() {
   // updateDateAndVersion.call(this);
});

//update updatedTimestamp and documentVersion on each 'findOneAndUpdate'
BaseSchema.pre('findOneAndUpdate',function(){
   // updateDateAndVersion.call(this);
});


BaseSchema.pre('save',function(next){
    this.updatedTimestamp = Date.now();
    this.documentVersion += 1;
    next();
});

//extend other models from BaseSchema to support transactions
//transactionSupport.registerHooks(BaseSchema);

mongoose.model('Base', BaseSchema);

module.exports = BaseSchema;
