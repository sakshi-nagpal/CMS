'use strict';
/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Catalog = mongoose.model('Catalog');

module.exports = function (app) {

    app.route('/health')
        .get(function(req, res, next) {

            var url = req.protocol + '://' + req.headers.host + req.url;

            var healthStatus = {
                "_links": {
                    "self": { "href": url }
                },
                "name":"Baloo API",
                "version":req.app.locals.version
            };

            Catalog.find({}, function(err, list) {
                if(!list || !list.length || err) {
                    healthStatus.mongoStatus = "sick";
                }
                res.send(healthStatus);
            });
        }
    );

};
