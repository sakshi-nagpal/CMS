'use strict';

/**
 * Module dependencies.
 */
var scenarioReverseMigrator = require('../../controllers/scenarioReverseMigrator.server.controller');

module.exports = function(app) {
    app.route('/reverse-migrate/scenario')
        .get(scenarioReverseMigrator.hasAuthorization(['System Admin']),scenarioReverseMigrator.migrate);

    app.route('/billi-to-billi-migrate/scenario')
        .post(scenarioReverseMigrator.billiToBilliMigrate);
};
