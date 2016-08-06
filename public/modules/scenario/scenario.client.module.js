'use strict';

define([
    './controllers/scenario.client.controller',
    'commentPopupService',
    './services/scenario.comment.popup.service',
    './services/scenarioPhaseAuthorization.client.service',
    './services/simulation.client.service',
    './directives/scenarioPhaseAuthorization.client.directive',
    './directives/sim5config.client.directive',
    'stepListView',
    'stepService',
    'scenarioService',
    'commentsModule',
    'appModule'
], function (scenarioController,CommentPopupService,ScenarioCommentPopupService, scenarioPhaseAuthorizationService, SimulationService,
             scenarioPhaseAuthorizationDirective,sim5ConfigDirective, stepListViewDirective, stepService, scenarioService) {

    ApplicationConfiguration.registerModule('scenario',['comments']);
    var module = angular.module('scenario');
    module
        .controller(scenarioController[0], scenarioController[1])
        .factory(CommentPopupService[0], CommentPopupService[1])
        .factory(ScenarioCommentPopupService[0], ScenarioCommentPopupService[1])
        .factory(scenarioPhaseAuthorizationService[0], scenarioPhaseAuthorizationService[1])
        .factory(SimulationService[0], SimulationService[1])
        .directive(scenarioPhaseAuthorizationDirective[0], scenarioPhaseAuthorizationDirective[1])
        .directive(sim5ConfigDirective[0], sim5ConfigDirective[1])
        .directive(stepListViewDirective[0], stepListViewDirective[1])
        .factory(stepService[0], stepService[1])
        .factory(scenarioService[0], scenarioService[1]);
});
