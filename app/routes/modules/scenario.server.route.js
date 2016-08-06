'use strict';

/**
 * Module dependencies.
 */

var scenarios = require('../../controllers/scenario.server.controller');
var step = require('../../controllers/scenario.step.server.controller');
var user = require('../../controllers/users/users.authorization.server.controller.js');

module.exports = function(app) {
    // scenarios Routes
    app.route('/task/:taskId/scenarios')
        .get(scenarios.getScenariosByTaskId);

    app.route('/steps/methodTypes')
        .get(scenarios.getScenarioMethodTypes);

    app.route('/scenarios/exists')
        .get(scenarios.getScenarioObjectId);

    app.route('/scenarios/:newFriendlyId')
        .post(user.can('edit_content'),scenarios.create);

    app.route('/scenarios/:friendlyId/phase/:phaseCode/transition')
        .put(scenarios.changePhase);

    app.route('/scenarios/:friendlyId')
        .get(scenarios.getScenario)
        .put(user.can('edit_task_metadata'),scenarios.updateScenario);

    app.route('/scenarios/:friendlyId/source/:sourceFriendlyId/copy')
        .put(scenarios.copyScenario);

    app.route('/scenarios/:friendlyId/source/:sourceFriendlyId/import/step/:stepId')
        .put(scenarios.createStep);

    app.route('/scenarios/:friendlyId/import/step/:stepId')
        .put(scenarios.importLibraryStep);

    app.route('/scenarios/:friendlyId/siblings')
        .get(scenarios.getSiblings);


    app.route('/scenarios/:id/step/:stepId/skills')
        .put(user.can('edit_content'), scenarios.updateSkillsForStep);

    app.route('/scenarios/:friendlyId/steps')
        .post(user.can('edit_content'), scenarios.createStep);

    // app.route('/scenarios/:friendlyId/steps/copy')
    //     .put(scenarios.copySteps);


    app.route('/scenarios/:friendlyId/steps/:stepIndex')
        .get(scenarios.getStep);

    app.route('/scenarios/:friendlyId/steps/:stepId/index/:stepIndex/reorder')
        .put(user.can('edit_content'),scenarios.isScenarioPhaseEditable,step.reorderSteps);

    app.route('/scenarios/:friendlyId/steps/:stepId')
        .get(scenarios.getStep)
        .delete(user.can('edit_content'),scenarios.isScenarioPhaseEditable,scenarios.deleteStep)
        .put(user.can('edit_content'),scenarios.isScenarioPhaseEditable,scenarios.updateStep);


    app.route('/scenarios/:friendlyId/steps/id/:stepId')
        .get(scenarios.getMethodsByStepId);

    app.route('/scenarios/:friendlyId/steps/id/:stepId/index')
        .get(step.getStepIndex);

    app.route('/scenarios/:friendlyId/method/:methodId/status/:methodStatus')
        .put(user.can('edit_method_status'),step.changeMethodStatus);

    app.route('/scenarios/:friendlyId/isActive/:isActive')
        .put(user.can('edit_scenario_status'),scenarios.changeScenarioStatus);

    app.route('/scenarios/methods/support')
        .get(user.can('edit_method_status'),step.updateMethodsInScenarios);

    // Finish by binding the scenario middleware    
    app.param('friendlyId', scenarios.ScenarioByfriendlyId,'friendlyId');
    app.param('sourceFriendlyId', scenarios.ScenarioByfriendlyId,'sourceFriendlyId');

};


