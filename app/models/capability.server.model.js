
'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var roleCapabilitiesSchema = new Schema({
	capability : {
		type: String,
		required: 'capability name cant be left blank.'
	},
	roles : {
		type: [String],
		required: 'availableTo cant be blank'
	}
});

mongoose.model('capability', roleCapabilitiesSchema);
