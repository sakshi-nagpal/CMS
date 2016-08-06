'use strict';
define([], function () {

    return ['CommentsBaseController', ['$scope', 'CommentService',
        function ($scope, CommentService) {

            $scope.postComment = function (text) {
                $scope.enterComments = false;
                CommentService.getAllThreads.save({
                    scenarioId: $scope.scenarioId,
                    stepId: $scope.stepId
                }, {text: text}, function (response) {
                    //  $scope.setFlagsToThreads(response, -1);
                    $scope.getAllComments(-1);
                    $scope.newComment = '';
                });
            };

            $scope.replyComment = function ($index, replyCommentText, threadId) {
                if ($scope.replyState.threadIndex != -1) {
                    $scope.threads[$scope.replyState.threadIndex].reply = false;
                }
                CommentService.replyCommentThread.save({
                    threadId: threadId
                }, {text: replyCommentText}, function (response) {
                    $scope.getAllComments($index);
                    $scope.replyCommentText = ''

                });

            };

            $scope.editThread = function ($index, editCommentText, threadId, commentId) {
                CommentService.editThread.save({
                    threadId: threadId,
                    commentId: commentId
                }, {text: editCommentText}, function (response) {
                    $scope.getAllComments($index);
                    // $scope.updateThread(response, threadId);
                    $scope.editCommentText = ''
                });

            };

            $scope.editReply = function ($index, editReplyText, threadId, commentId) {
                CommentService.editThread.save({
                    threadId: threadId,
                    commentId: commentId
                }, {text: editReplyText}, function (response) {
                    $scope.getAllComments($index);
                    $scope.editReplyText = ''
                });


            };

            $scope.deleteReply = function (parentIndex, index, threadId, commentId, msg) {
                if (msg == 'Yes') {
                    CommentService.deleteReplyThread.delete({
                        threadId: threadId,
                        commentId: commentId
                    }, function (response) {
                        $scope.getAllComments(parentIndex);
                        //      $scope.spliceThread(response, threadId);
                        $scope.editState = {threadIndex: -1, commentIndex: -1};
                        $scope.replyState = {threadIndex: -1};
                    });
                    if (parentIndex != -1 && $scope.threads[parentIndex] != undefined) {
                        $scope.threads[parentIndex].isCollapsed = false;
                    }
                }
                resettingDeleteConfirmation();

            };

            $scope.markAsRead = function (parentIndex,threadId, commentId) {
                    CommentService.markAsRead.save({
                        threadId: threadId,
                        commentId: commentId
                    }, function (response) {
                        $scope.getAllComments(parentIndex);
                    });
            };

            $scope.deleteScenarioReply = function (stepIndex, parentIndex, index, threadId, commentId, msg) {
                if (msg == 'Yes') {
                    $scope.showDeleteConfirm[parentIndex] = false;
                    CommentService.deleteReplyThread.delete({
                        threadId: threadId,
                        commentId: commentId
                    }, function (response) {
                        $scope.getAllComments(parentIndex);
                        //$scope.spliceThread(stepIndex, response, threadId);
                        $scope.editState = {threadIndex: -1, commentIndex: -1};
                        $scope.replyState = {threadIndex: -1};
                    });

                } else {
                    resettingDeleteConfirmation();
                }


            };

            $scope.deleteThreadMethod = function (index, replyIndex) {
                resettingDeleteConfirmation();
                $scope.showDeleteConfirm[index] = true;
                $scope.replyIndex = replyIndex;
            };

            $scope.deleteComment = function (index, threadId, msg) {
                if (msg == 'Yes') {
                    $scope.showDeleteConfirm[index] = false;
                    CommentService.deleteThread.delete({
                        scenarioId: $scope.scenarioId,
                        stepId: $scope.stepId,
                        threadId: threadId
                    }, function (response) {
                        $scope.getAllComments(index);
                        //   $scope.spliceThread(response, threadId);
                        $scope.editState = {threadIndex: -1, commentIndex: -1};
                        $scope.replyState = {threadIndex: -1};
                    });
                    if (index != -1 && $scope.threads[index] != undefined) {
                        $scope.threads[index].isCollapsed = false;
                    }
                } else {
                    resettingDeleteConfirmation();

                }
            };

            $scope.deleteScenarioThreadMethod = function (stepIndex, index, replyIndex) {
                resettingDeleteConfirmation();
                $scope.showDeleteConfirm[index] = true;
                $scope.replyIndex = replyIndex;
                $scope.deleteStepIndex = stepIndex;
            };

            $scope.deleteScenarioComment = function (stepIndex, index, threadId, stepId, msg) {

                if (msg == 'Yes') {
                    $scope.showDeleteConfirm[index] = false;
                    CommentService.deleteThread.delete({
                        scenarioId: $scope.scenarioId,
                        stepId: stepId,
                        threadId: threadId
                    }, function (response) {
                        $scope.getAllComments();
                        // $scope.spliceThread(stepIndex, response, threadId);
                        $scope.editState = {threadIndex: -1, commentIndex: -1};
                        $scope.replyState = {threadIndex: -1};
                    });
                }
                else {
                    resettingDeleteConfirmation();
                }


            };

            function resettingDeleteConfirmation() {

                for (var i = 0; i < $scope.showDeleteConfirm.length; i++) {
                    $scope.showDeleteConfirm[i] = false;
                }

            };

            $scope.closeAddComment = function (length) {
                if (length != 0)
                    $scope.enterComments = false;
                else
                    $scope.close();
            };

        }]]
})
