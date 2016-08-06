'use strict';

define([
    './controllers/comments.base.client.controller',
    './controllers/comments.client.controller',
    './controllers/scenario.comments.client.controller',
    './services/comment.client.service',
    './services/scenario.comment.client.service',
    './directives/comment.focus.textbox.directive',
    'angularMoment',
    'ngScroll',
    'appModule'

], function (BaseController, CommentsController, ScenarioCommentsController, CommentService, ScenarioCommentService,TextBoxFocusDirective) {

    ApplicationConfiguration.registerModule('comments', ['angularMoment', 'ngScrollTo']);
    var module = angular.module('comments');
    module.controller(BaseController[0], BaseController[1]);
    module.controller(CommentsController[0], CommentsController[1]);
    module.controller(ScenarioCommentsController[0], ScenarioCommentsController[1])
    module.factory(CommentService[0], CommentService[1]);
    module.factory(ScenarioCommentService[0], ScenarioCommentService[1]);
    module.directive(TextBoxFocusDirective[0],TextBoxFocusDirective[1]);

});
