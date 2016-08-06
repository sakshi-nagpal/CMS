'use strict';

/**
 * Module dependencies.
 */

var sim5config = require('../../controllers/sim5config.server.controller'),
    user = require('../../controllers/users/users.authorization.server.controller');

module.exports = function(app) {
    app.route('/sim5config/options/role/:role')
        .get(user.can('launch_simulation'),sim5config.getConfigForRole);
    app.route('/sim5config/launch')
        .get(user.can('launch_simulation'),sim5config.launchSimulation);
};
