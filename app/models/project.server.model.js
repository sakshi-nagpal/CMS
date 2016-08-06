var mongoose = require('mongoose'),
    ContentSchema = require('./content.server.model.js'),
    ScenarioTypeObject = require('./scenarioTypeEnum.server.model'),
    extend = require('mongoose-schema-extend'),
    ScenarioTypeEnum = mongoose.model('scenarioTypeEnum'),
    Promise = require('promise');

var ProjectDocumentSchema = mongoose.Schema({
    category: {type: mongoose.Schema.Types.ObjectId, ref: 'DocumentCategory'},
    files: [{type: mongoose.Schema.Types.ObjectId, ref: 'files'}]
}, {_id: false});

/*var content_ref_obj = {
 scenario_ref: {
 type: mongoose.Schema.Types.ObjectId,
 ref: 'ScenarioReference'
 },
 doc_name: {
 type: String,
 trim: true
 }
 };*/

/*ScenarioTypeEnum.find({}).exec().then(function(scenarioTypes) {

 scenarioTypes.forEach(function(scenarioType) {
 content_ref_obj[scenarioType.code] = {
 scenario_ref: {
 type: mongoose.Schema.Types.ObjectId,
 ref: 'ScenarioReference'
 },
 doc_name: {
 type: String,
 trim: true
 }
 };
 });
 content_ref_obj = {
 scenario_ref: {
 type: mongoose.Schema.Types.ObjectId,
 ref: 'ScenarioReference'
 },
 doc_name: {
 type: String,
 trim: true
 }
 }; mongoose.model('Project', ProjectSchema);
 }
 );*/

var ProjectSchema = ContentSchema.extend({
    data: {
        content_ref: [
            {
                _id: false,
                type: {
                    type: String,
                    trim: true
                },
                scenario_ref: {
                    type: mongoose.Schema.Types.ObjectId,
                    trim: true,
                    ref: 'ScenarioReference'
                },
                doc_name: {
                    type: String,
                    trim: true
                }
            }
        ],
        documents: [{_id: false, scenarioType: ScenarioTypeObject, documents: [ProjectDocumentSchema]}]
    }
});

mongoose.model('Project', ProjectSchema);
