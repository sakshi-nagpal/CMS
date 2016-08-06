
var sim5StatusMigrator = require("../../migrators/sim5/sim5ToBalooStatusMigrator");

module.exports = function(app){

    app.route('/sims-to-baloo-migrate/scenario/pathway/status')
      .post(sim5StatusMigrator.simsToBalooScenarioPathwayStatusMigrator);

    app.route('/sims-to-baloo-migrate/task-scenario/isActive')
        .post(sim5StatusMigrator.simsToBalooTaskScenarioIsActiveMigrator);

};
