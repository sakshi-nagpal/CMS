'use strict';

var mongoose = require('mongoose'),
    BaseSchema = require('./baseEntity.server.model');

var Comment = {
    text: {type: String},
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    timeStamp: {type: Date},
    isNew: {type: Boolean}
};

var CommentSchema = new mongoose.Schema({
    sequence: Number,
    comment: Comment
});

var ThreadSchema = BaseSchema.extend({
    comments: [CommentSchema]
});

mongoose.model('threads', ThreadSchema);

module.exports = ThreadSchema;
