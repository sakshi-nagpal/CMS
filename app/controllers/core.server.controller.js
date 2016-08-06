'use strict';

/**
 * Module dependencies.
 */
exports.index = function(req, res) {
	res.render('index', {
		user: req.user || null,
		capabilities: req.app.get('capabilities') || null,
		phases: req.app.get('phases') || null,
		request: req
	});
};

