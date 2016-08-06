'use strict';

/**
 * Module dependencies.
 */
var libraryStep = require('../../controllers/libraryStep.server.controller');

module.exports = function(app) {

    app.route('/library/skill/id/:skillId/steps')
        .get(libraryStep.getLibraryStepsBySkillId);

    app.route('/library/step/create')
        .post(libraryStep.createLibraryStep);

    app.route('/library/step/:libraryStepId')
        .get(libraryStep.getLibraryStepById)
        .delete(libraryStep.deleteLibraryStep)
        .put(libraryStep.updateLibraryStep);

    app.route('/library/step/:libraryStepId/mapped/tasks')
        .get(libraryStep.getMappedStepDetails);

    app.route('/library/step/:libraryStepId/mapped/add')
        .put(libraryStep.addMappedStepDetails);

    app.route('/library/step/:libraryStepId/skills')
        .put(libraryStep.updateSkillsForLibraryStep);


    app.param('libraryStepId', libraryStep.libraryStepById,'libraryStepId');
};
