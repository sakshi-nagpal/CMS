'use strict';

var mongoose = require('mongoose'),
    BaseSchema = require('./baseEntity.server.model');

var FileSchema = BaseSchema.extend({
    _id: {type: mongoose.Schema.Types.ObjectId},
    originalName: {type: String},
    fileType: {type: String},
    tmpName: {type: String},
    location: {type: String},
    fileSize: {type: Number},
    timeStamp: {type: Date}
});

mongoose.model('files', FileSchema);

module.exports = FileSchema;
