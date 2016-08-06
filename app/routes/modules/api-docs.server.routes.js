'use strict';

/**
 * @type {SwaggerParser|exports}
 */
var swaggerParser = require('swagger-parser');


module.exports = function (app) {

    app.route('/api-docs')
        .get(function(req, res, next) {

            swaggerParser.dereference('app/api-docs/index.json',{$refs: {
                internal: false   // Don't dereference internal $refs
            }}, function(err, result) {
                res.json(result);
        });
    });

};
