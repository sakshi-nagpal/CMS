'use strict';

module.exports = function(app) {
	// Root routing
	var core = require('../../controllers/core.server.controller.js');
	app.route('/').get(core.index);
};
