var pathwaysExporter = require('../../exporter/allPathways/pathwaysExporter');
var taskData = require('../../exporter/taskData/TaskDataExport');
var history = require('../../exporter/history/historyExporter');
var contents = require('../../controllers/content.server.controller');
var scenario = require('../../controllers/scenario.server.controller');
var contentHierarchyExporter = require('../../exporter/contentHierarchy/contentHierarchyExporter');
var scenarioDocumentsExporter = require('../../exporter/scenarioDocuments/scenarioDocumentsExporter');

module.exports = function(app){

    app.route('/series/all')
        .get(contents.getAllSeries);

    app.route('/export/series/:id')
        .get(contentHierarchyExporter.exportContentHierarchy);

    app.route('/export/series/:id/pathway')
        .get(pathwaysExporter.getSeriesPathway);


    app.route('/export/series/task/:id')
        .get(taskData.exportDataBySeries);

    app.route('/export/task/data')
        .get(taskData.exportDataByInput);

    app.route('/export/scenarios/exists')
        .get(scenario.checkIfScenarioExists);

    app.route('/export/history/entityType/:type')
        .get(history.getHistoryReportForType);

    app.route('/export/scenario/documents')
        .get(scenarioDocumentsExporter.getScenarioFileData);

};
