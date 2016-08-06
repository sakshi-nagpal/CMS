'use strict';


module.exports = function(app) {
    var users = require('../controllers/users.server.controller.js');
    var scenarios = require('../controllers/scenario.server.controller.js');
    var contents = require('../controllers/content.server.controller');
    //var skills = require('../controllers/skills.server.controller');

    users.capabilities(function(data) {
        var capabilities = transformObj(data, "capability", "roles");
        app.set('capabilities', capabilities);
    });

    scenarios.scenarioPhaseTypes(function(data) {
        app.set('phases', data);
    });

    //skills.skillIndexByApplication();

    app.route('/auth/signin').post(users.signin);

    app.use('/', function (req, res, next) {

        if (req.url === '/' || req.isAuthenticated() || req.url === '/auth/signout' || req.url.indexOf('api-docs') >0 || req.url.indexOf('health') >0) {
            next();
        }else {
            res.status(401).send({
                message: 'User is not logged in'
            });
        }
    });
};

/**
 * The function transforms the capabilities object returned from the db to (capability : [roles]) syntax.
 * It takes the raw json data.
 * The key for the transformed json needs to be passed as second argument.
 * The value for the transformed json is passed as third argument of the function.
 *
 * @param data
 * @param key
 * @param value
 * @returns {{}}
 */
var transformObj = function(data, key, value) {
    var transformedJson = {};
    for(var node=0; node < data.length; node++){
        transformedJson[data[node][key]] = data[node][value];
    }
    return transformedJson;
};
