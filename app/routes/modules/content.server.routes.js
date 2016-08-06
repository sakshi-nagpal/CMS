'use strict';

/**
 * Module dependencies.
 */
var contents = require('../../controllers/content.server.controller'),
    contentHierarchyExporter = require('../../exporter/contentHierarchy/contentHierarchyExporter'),
    user = require('../../controllers/users/users.authorization.server.controller.js');

module.exports = function (app) {
    // OfficeVersion Routes
    app.route('/series/:seriesId/hierarchy')
        .get(contents.hierarchyBySeriesId);
    app.route('/series/:seriesId/parent/:parentType/child/:childType/count')
        .get(contents.childCountByType);
    app.route('/series/:seriesId/element/:elementId/hierarchy')
        .get(contents.hierarchyByElementId);
    app.route('/element/:elementId/ancestors')
        .get(contents.ancestorsByElementId);
    app.route('/series/:seriesId/element/:elementId/task/phases')
        .get(contents.taskPhasesByElementId);
    app.route('/task/:taskId')
        .get(contents.taskById)
        .put(contents.updateTask);

    app.route('/project/:projectId/scenario/reference')
        .get(contents.getScenarioReferences)
        .post(contents.updateScenarioReference);

    app.route('/project/:projectId').get(contents.getProjectById);
    app.route('/element/:elementId/series').get(contents.getSeriesByElementId);

    app.route('/task/:taskId/isActive/:isActive')
        .put(user.can('edit_task_status'), contents.changeTaskStatus);

    app.route('/chapter/:elementId/update/phase/:phaseCode')
        .post(user.can('bulk_phase_change'), contents.changePhaseByContent);

    // Finish by binding the content middleware
    app.param('seriesId', contents.seriesByID);
    app.param('elementId', contents.elementByID);
    app.param('projectId', contents.projectByID);
};
