'use strict';

var thread = require('../../controllers/thread.server.controller');

module.exports = function (app) {
    app.route('/threads/scenario/:threadScenarioId/step/:step')
        .get(thread.getStepThreads);
    app.route('/threads/scenario/:threadScenarioId')
        .get(thread.getScenarioThreads);
    app.route('/threads/scenario/:threadScenarioId')
        .post(thread.addScenarioThread);
    app.route('/threads/scenario/:threadScenarioId/step/:step')
        .post(thread.addStepThread);
    app.route('/threads/thread/:thread')
        .post(thread.addComment);
    app.route('/threads/thread/:thread/comment/:comment')
        .post(thread.updateComment);
    app.route('/threads/thread/:thread/comment/:comment')
        .delete(thread.deleteComment);
    app.route('/threads/scenario/:threadScenarioId/step/:step/thread/:thread')
        .delete(thread.deleteThread);
    app.route('/threads/scenario/:threadScenarioId/thread/:thread')
        .delete(thread.deleteScenarioThread);
    app.route('/threads/count/scenario/:threadScenarioId/step/:step')
        .get(thread.getStepNewCommentCount);
    app.route('/threads/count/scenario/:threadScenarioId')
        .get(thread.getScenarioNewCommentCount);
    app.route('/threads/read/thread/:thread/comment/:comment')
        .post(thread.markAsRead);

    app.param('threadScenarioId', thread.getScenario);
    app.param('step', thread.getStep);
    app.param('thread', thread.getThread);
    app.param('comment', thread.comment);
};
