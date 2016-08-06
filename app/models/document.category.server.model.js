'use strict';

var mongoose = require('mongoose');

var DocumentCategorySchema = new mongoose.Schema({
    code: {
        type: String
    },
    displayName: {
        type: String
    },
    allowedAmount: {
        type: String
    },
    notifications: {
        type: Boolean
    },
    order: {
        type: Number
    },
    fileSize: {
        type: Number
    },
    required: {
        type: Boolean
    },
    capability: {
        type: String
    },
    allowedPhases: [{
        type: String
    }],
    downloadOnly: {type: Boolean}
});

mongoose.model('DocumentCategory', DocumentCategorySchema);

module.exports = DocumentCategorySchema;
