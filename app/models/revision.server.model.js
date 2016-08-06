var mongoose = require('mongoose'),
    BaseSchema = require('./baseEntity.server.model');



var RevisionSchema = BaseSchema.extend({
    revision: {},
    typeVersion: {
        type: Number,
        default: 1
    }
});

mongoose.model('Revision',RevisionSchema);
