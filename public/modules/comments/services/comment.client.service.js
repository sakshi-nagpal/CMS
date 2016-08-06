define([], function () {
    return ['CommentService', ['$resource', '$http', function ($resource, $http) {
        return {

            getAllThreads: $resource('/threads/scenario/:scenarioId/step/:stepId',
                {scenarioId: '@scenarioId', stepId: '@stepId'}),
          replyCommentThread: $resource('/threads/thread/:threadId',
            {threadId: '@threadId'}),
            editThread: $resource('/threads/thread/:threadId/comment/:commentId',
                {threadId: '@threadId', commentId: '@commentId'}),
            deleteReplyThread: $resource('/threads/thread/:threadId/comment/:commentId',
                {threadId: '@threadId', commentId: '@commentId'}),
            deleteThread: $resource('/threads/scenario/:scenarioId/step/:stepId/thread/:threadId',
                {scenarioId: '@scenarioId', stepId: '@stepId',threadId: '@threadId'}),
            markAsRead: $resource('/threads/read/thread/:threadId/comment/:commentId',
                {threadId: '@threadId', commentId: '@commentId'}),
            getStepNewCommentCount: $resource('threads/count/scenario/:scenarioId/step/:stepId',
                {scenarioId: '@scenarioId', stepId: '@stepId'}),
            getScenarioNewCommentCount: $resource('/threads/count/scenario/:scenarioId',
                {scenarioId: '@scenarioId'})



        };
    }]]
});




