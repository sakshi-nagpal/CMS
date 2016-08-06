'use strict';
define([], function () {

    return ['CommentsController', ['$scope', '$controller', 'CommentService', 'Authentication', '$location', '$anchorScroll','title', 'stepIndex', 'scenarioId', 'stepId', 'stepNewCommentCountArray','$modalInstance',
        function ($scope, $controller, CommentService, Authentication, $location, $anchorScroll,title, stepIndex, scenarioId, stepId, stepNewCommentCountArray,$modalInstance) {
            $scope.scenarioId=scenarioId;
            $scope.stepId=stepId;
            angular.extend(this, $controller('CommentsBaseController', {$scope: $scope}));
            $scope.newComment = '';
            $scope.replyCommentText = '';
            $scope.enterComments = false;
            $scope.threadIndex = -1;
            $scope.commentIndex = -1;
            $scope.showDeleteConfirm = [];
            $scope.showDeleteReplyConfirm = [];
            $scope.editState = {threadIndex: -1, commentIndex: -1};
            $scope.replyState = {threadIndex: -1};
            getAllComments($scope.threadIndex);
            $scope.popupTitle= title;
            $scope.focusInput = true;
            $scope.stepNewCommnetCount=[];

            function getStepNewCommentCount(stepIndex,stepId){              
                CommentService.getScenarioNewCommentCount.get({
                    scenarioId:scenarioId
                }, function (response) {
                    stepNewCommentCountArray.countArray[stepIndex].count=response.steps[stepIndex].count;
                }, function (errorResponse) {
                    $scope.error = errorResponse.data.message;

                }) ;

            };

            $scope.edit = function (threadIndex, commentIndex) {

                clearReplyState();
                clearEditState();

                if (threadIndex != -1 && commentIndex != -1) {
                    $scope.threads[threadIndex].thread.comments[commentIndex].isEditable = true;
                    $scope.threads[threadIndex].isCollapsed = false;
                    $scope.editState.threadIndex = threadIndex;
                    $scope.editState.commentIndex = commentIndex;

                }
                else if (threadIndex != -1) {
                    $scope.threads[threadIndex].isEditable = true;
                    $scope.threads[threadIndex].isCollapsed = false;
                    $scope.editState.threadIndex = threadIndex;
                    $scope.editState.commentIndex = commentIndex;
                }

                if (threadIndex == -1 && commentIndex == -1) {
                    getAllComments(threadIndex);
                }
                for(var i=0;i<$scope.showDeleteConfirm.length;i++){
                    $scope.showDeleteConfirm[i]=false;
                }
                gotToReplyText(threadIndex, commentIndex, 'edit');

            }

            var clearEditState = function () {

                if ($scope.editState.threadIndex != -1 && $scope.editState.commentIndex != -1) {
                    $scope.threads[$scope.editState.threadIndex].thread.comments[$scope.editState.commentIndex].isEditable = false;

                }
                else if ($scope.editState.threadIndex != -1 && $scope.editState.threadIndex != undefined) {
                    $scope.threads[$scope.editState.threadIndex].isEditable = false;
                }
                $scope.enterComments = false;
            }

            var clearReplyState = function () {
                if ($scope.replyState.threadIndex != -1) {
                    $scope.threads[$scope.replyState.threadIndex].reply = false;
                }
                $scope.enterComments = false;
            }

            $scope.reSettingDeleteMessage=function(parentIndex){
                for(var i=0;i<$scope.showDeleteConfirm.length;i++){
                    $scope.showDeleteConfirm[i]=false;
                }

            };

            $scope.reply = function (threadIndex) {
                clearReplyState();
                clearEditState();
                if (threadIndex != -1) {
                    $scope.threads[threadIndex].reply = true;
                    $scope.replyState.threadIndex = threadIndex;
                }

                for(var i=0;i<$scope.showDeleteConfirm.length;i++){
                    $scope.showDeleteConfirm[i]=false;
                }
                gotToReplyText(threadIndex, -1, 'reply');
            }

            function gotToReplyText(threadIndex, commentIndex, type) {
                threadIndex = threadIndex != -1 ? threadIndex : 0;
                if (type == 'reply') {
                    $location.hash('replyText' + threadIndex);
                }
                if (type == 'edit') {
                    if (commentIndex == -1) {
                        $location.hash('anchor_' + threadIndex);
                    } else {
                        $location.hash('anchor_' + threadIndex + '_' + commentIndex);
                    }
                }
            };

            function getAllComments($index) {

                $scope.loggedUser = Authentication.user;
                CommentService.getAllThreads.query({
                    scenarioId: scenarioId,
                    stepId: stepId
                }, function (response) {
                    $scope.threads = response;
                    getStepNewCommentCount(stepIndex,stepId);
                    $scope.threads.forEach(function (thread) {
                        thread.isEditable = false;
                        thread.reply = false;
                        thread.isCollapsed = true;
                        thread.thread.comments.forEach(function (comment) {
                            comment.isEditable = false;
                        });
                    })
                    if ($index != -1 && $scope.threads[$index] != undefined) {
                        $scope.threads[$index].isCollapsed = false;
                    }
                }, function (errorResponse) {
                    $scope.error = errorResponse.data.message;
                });

            }

            $scope.getAllComments = function ($index) {
                getAllComments($index);
            }
            $scope.close = function () {
                getStepNewCommentCount(stepIndex,stepId);
                $modalInstance.close();
            };

          /*  $scope.setFlagsToThreads = function (response, index) {
                setFlagsToThreads(response, index);
            }

            $scope.spliceThread = function (response, threadId) {
                removeThread(response, threadId);
            }
            $scope.updateThread = function (response, threadId) {
                updateThread(response, threadId);
            }

            function updateThread(response, threadId) {
                var itemIndex = $scope.threads.map(function (element) {
                    return element.thread._id;
                }).indexOf(threadId);
                $scope.threads[itemIndex].thread.comments[0] = response.thread.comments[0];
                $scope.threads[itemIndex].thread.isEditable = false;
                // $scope.threads.splice(itemIndex, 1);
            }


            function removeThread(response, threadId) {
                var itemIndex = $scope.threads.map(function (element) {
                    return element.thread._id;
                }).indexOf(threadId);
                if (response) {
                    $scope.threads.splice(itemIndex, 1);
                } else {
                    $scope.threads[itemIndex].thread = response.thread;
                }

            }

            function setFlagsToThreads(response, $index) {
                $scope.threads = response.threads;
                $scope.threads.forEach(function (thread) {
                    thread.isEditable = false;
                    thread.reply = false;
                    thread.isCollapsed = true;
                    thread.thread.comments.forEach(function (comment) {
                        comment.isEditable = false;
                    });
                })
                if ($index != -1 && $scope.threads[$index] != undefined) {
                    $scope.threads[$index].isCollapsed = false;
                }
            };
*/
        }]];
});

