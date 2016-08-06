'use strict';

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var rolesSchema = new Schema({
	name : {
		type: String,
		required: 'name name cant be left blank.'
	},
	desc : {
		type: String,
		required: 'desc cant be blank'
	}
});

mongoose.model('role', rolesSchema);
