'use strict';

/**
 * Module dependencies.
 */

var scenarioDocumentsMigrator = require('../../migrators/scenarioDocumentsMigrator/scenarioDocumentsMigrator');
var scenarioContentMigrator = require('../../migrators/scenarioContentMigrator/scenario.content.migrator');
var contentHierarchyMigrator = require('../../migrators/conetentHierarchyMigrator/content.hierarchy.migrator');
var projectDocumentMigrator = require('../../migrators/projectDocumentMigrator/project.document.migrator.controller');
var scenarioAudioTimingMigrator = require('../../migrators/scenarioAudioTimingMigrator/scenario.audio.timing.migrator');

module.exports = function (app) {
    app.route('/billi-to-baloo-migrate/scenario/documents')
        .get(scenarioDocumentsMigrator.migrateScenariosDocuments);

    app.route('/billi-to-baloo-migrate/scenario/content')
        .get(scenarioContentMigrator.migrateScenarios);

    app.route('/billi-to-baloo-migrate/content/hierarchy')
        .get(contentHierarchyMigrator.migrateContentHierarchy);

    app.route('/billi-to-baloo-migrate/project/documents')
        .get(projectDocumentMigrator.migrateProjectDocuments);

    app.route('/billi-to-baloo-migrate/scenario/audio/timing')
        .get(scenarioAudioTimingMigrator.migrateScenarioAudioTiming);
};
