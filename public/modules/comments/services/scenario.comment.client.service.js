'use strict';
define([], function () {
    return ['ScenarioCommentService', ['$resource', '$http', function ($resource, $http) {
        return {

            getAllStepsThreads: $resource('/threads/scenario/:scenarioId',
                {scenarioId: '@scenarioId'}),
            postScenarioComment: $resource('/threads/scenario/:scenarioId',
                {scenarioId: '@scenarioId'}),
            replyScenarioCommentThread: $resource('/threads/thread/:threadId',
                {threadId: '@threadId'}),
            deleteScenarioThread: $resource('/threads/scenario/:scenarioId/thread/:threadId',
                {scenarioId: '@scenarioId',threadId: '@threadId'})


        };
    }]]
});




