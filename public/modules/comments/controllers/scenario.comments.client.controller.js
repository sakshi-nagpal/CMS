'use strict';
define([], function () {

    return ['ScenarioCommentsController', ['$scope', '$controller', 'ScenarioCommentService', 'CommentService','Authentication', '$location', '$anchorScroll','title','scenarioId','scenarioNewCommentCount','$modalInstance',
        function ($scope, $controller, ScenarioCommentService, CommentService,Authentication, $location, $anchorScroll,title,scenarioId,scenarioNewCommentCount,$modalInstance) {
            $scope.scenarioId=scenarioId.id
            angular.extend(this, $controller('CommentsBaseController', {$scope: $scope}));

            $scope.isCollapsed = true;
            $scope.newComment = '';
            $scope.replyCommentText = '';
            $scope.enterComments = false;
            $scope.threadIndex = -1;
            $scope.commentIndex = -1;
            /*$scope.stepThreadsCheck = true;*/
            $scope.showDeleteConfirm = [];
            $scope.showScenarioDeleteConfirm = [];
            $scope.editState = {stepIndex: -1, threadIndex: -1, commentIndex: -1};
            $scope.replyState = {stepIndex: -1, threadIndex: -1};
            $scope.editScenarioState = {stepIndex: -1, threadIndex: -1, commentIndex: -1};
            $scope.replyScenarioState = {stepIndex: -1, threadIndex: -1};
            $scope.noComments='No Comments Found.';
            $scope.focusInput = true;
            $scope.popupTitle= title;
            $scope.scenarioNewComment=0;

            getAllComments();

            function getScenarioNewComment(scenarioId){
                CommentService.getScenarioNewCommentCount.get({
                    scenarioId:scenarioId.id
                }, function (response) {
                    $scope.scenarioNewComment=response.count;
                    scenarioNewCommentCount.count=$scope.scenarioNewComment;
                }, function (errorResponse) {
                    $scope.error = errorResponse.data.message;
                }) ;

            };

            $scope.edit = function (stepIndex, threadIndex, commentIndex) {
                clearReplyState();
                clearEditState();

                if (stepIndex != -1 && threadIndex != -1 && commentIndex != -1) {
                    $scope.scenario.stepThreads[stepIndex].threads[threadIndex].thread.comments[commentIndex].isEditable = true;
                    $scope.scenario.stepThreads[stepIndex].threads[threadIndex].isCollapsed = false;
                    $scope.editState.threadIndex = threadIndex;
                    $scope.editState.commentIndex = commentIndex;
                    $scope.editState.stepIndex = stepIndex;

                }
                else if (stepIndex != -1 && threadIndex != -1) {
                    $scope.scenario.stepThreads[stepIndex].threads[threadIndex].isEditable = true;
                    $scope.scenario.stepThreads[stepIndex].threads[threadIndex].isCollapsed = false;
                    $scope.editState.threadIndex = threadIndex;
                    $scope.editState.commentIndex = commentIndex;
                    $scope.editState.stepIndex = stepIndex;
                }
                if (threadIndex == -1 && commentIndex == -1 && stepIndex == -1) {
                    getAllComments();
                }
                resettingDeleteConfirmation();
                gotToReplyText(stepIndex, threadIndex, commentIndex, 'edit');
                clearScenarioEditState();
                clearScenarioReplyState();
            }

            var clearEditState = function () {
                if ($scope.editState.stepIndex != -1 && $scope.editState.threadIndex != -1 && $scope.editState.commentIndex != -1) {
                    $scope.scenario.stepThreads[$scope.editState.stepIndex].threads[$scope.editState.threadIndex].thread.comments[$scope.editState.commentIndex].isEditable = false;

                }
                else if ($scope.editState.threadIndex != -1 && $scope.editState.threadIndex != undefined) {
                    $scope.scenario.stepThreads[$scope.editState.stepIndex].threads[$scope.editState.threadIndex].isEditable = false;
                }
                $scope.enterComments = false;
            }

            var clearReplyState = function () {
                if ($scope.replyState.threadIndex != -1) {
                    $scope.scenario.stepThreads[$scope.replyState.stepIndex].threads[$scope.replyState.threadIndex].reply = false;
                }
                $scope.enterComments = false;
            }

            $scope.reply = function (stepIndex, threadIndex) {
                clearReplyState();
                clearEditState();
                if (stepIndex != -1 && threadIndex != -1 && $scope.scenario.stepThreads[stepIndex] != undefined) {
                    $scope.scenario.stepThreads[stepIndex].threads[threadIndex].reply = true;
                    //   $scope.threads[threadIndex].isCollapsed = true;
                    $scope.replyState.threadIndex = threadIndex;
                    $scope.replyState.stepIndex = stepIndex;
                }
                resettingDeleteConfirmation();
                gotToReplyText(stepIndex, threadIndex, -1, 'reply');
                clearScenarioReplyState();
                clearScenarioEditState();
            }

            $scope.getAllComments = function () {
                getAllComments();
            }

            $scope.postScenarioComment = function (newComment) {
                $scope.noComments='';
                $scope.enterComments = false;
                ScenarioCommentService.getAllStepsThreads.save({
                    scenarioId: $scope.scenarioId
                }, {text: newComment}, function (response) {
                    //  $scope.setFlagsToThreads(response, -1);
                    $scope.getAllComments();
                    $scope.newComment = '';
                });
            };

            $scope.replyScenarioCommentThread = function ($index, replyCommentText, threadId) {
                clearReplyState();
                ScenarioCommentService.replyScenarioCommentThread.save({
                    threadId: threadId
                }, {text: replyCommentText}, function (response) {
                    $scope.getAllComments();
                    $scope.replyCommentText = ''

                });

            };

            $scope.replyForStepComment = function ($index, replyCommentText, threadId) {
                if ($scope.replyScenarioState.threadIndex != -1) {
                    $scope.scenario.threads[$scope.replyScenarioState.threadIndex].reply = false;
                }
                CommentService.replyCommentThread.save({
                    threadId: threadId
                }, {text: replyCommentText}, function (response) {
                    $scope.getAllComments($index);
                    $scope.replyCommentText = ''

                });

            };
            function getAllComments() {

                $scope.loggedUser = Authentication.user;
                ScenarioCommentService.getAllStepsThreads.get({
                    scenarioId: scenarioId.id
                }, function (response) {
                    isStepCommentsAvailable(response);
                    getScenarioNewComment(scenarioId);
                    $scope.scenario = response.scenario;
                    $scope.scenario.threads.forEach(function (thread) {
                        thread.isEditable = false;
                        thread.reply = false;
                        thread.isCollapsed = true;
                        thread.thread.comments.forEach(function (comment) {
                            comment.isEditable = false;
                        });
                    })
                    for (var i = 0; i < $scope.scenario.stepThreads.length; i++) {
                        var step = $scope.scenario.stepThreads[i];
                        step.origStepIndex = i;
                        settingValues(step);
                    }
                   // isStepCommentsAvailable(response);
                }, function (errorResponse) {
                    $scope.error = errorResponse.data.message;
                });

            }

            function settingValues(step) {
                /*  if( step.threads.length==0){
                 $scope.stepThreadsCheck = false;
                 }*/
                step.threads.forEach(function (thread) {
                    // $scope.stepThreadsCheck = true;
                    thread.isEditable = false;
                    thread.reply = false;
                    thread.isCollapsed = true;
                    thread.thread.comments.forEach(function (comment) {
                        comment.isEditable = false;
                    });
                });

            }
            function isStepCommentsAvailable(response){
                $scope.scenario = response.scenario;
                var isCheck=false;
                for (var i = 0; i < $scope.scenario.stepThreads.length; i++) {
                    if( $scope.scenario.stepThreads[i].threads.length>0){
                        isCheck=true;
                        break;
                    }
                    else{
                        isCheck=false;
                    }
                }
                if (isCheck) {
                    $scope.stepThreadsCheck = true;
                } else {
                    $scope.stepThreadsCheck = false;
                }
            }

           /* $scope.spliceThread = function (stepIndex, response, threadId) {
                removeThread(stepIndex, response, threadId);
            }

            function removeThread(stepIndex, response, threadId) {
                var itemIndex=-1;
                if($scope.scenario.stepThreads[stepIndex]!=undefined) {
                    itemIndex = $scope.scenario.stepThreads[stepIndex].threads.map(function (element) {
                        return element.thread._id;
                    }).indexOf(threadId);
                }
                if(itemIndex!=-1){
                    //$scope.scenario.stepThreads[stepIndex].threads[itemIndex].thread = response;
                    $scope.scenario.stepThreads[stepIndex].threads.splice(itemIndex,1);
                }

            }*/

            function gotToReplyTextScenario(threadIndex, commentIndex, type) {
                if (type == 'reply') {
                    $location.hash('replyText' + '_' + threadIndex);
                }
                if (type == 'edit') {
                    if (commentIndex == -1) {
                        $location.hash('anchor_' + threadIndex);
                    } else {
                        $location.hash('anchor_' + threadIndex + '_' + commentIndex);
                    }
                }

            };

            $scope.editScenario = function (threadIndex, commentIndex) {

                clearScenarioReplyState();
                clearScenarioEditState();

                if (threadIndex != -1 && commentIndex != -1) {
                    $scope.scenario.threads[threadIndex].thread.comments[commentIndex].isEditable = true;
                    $scope.scenario.threads[threadIndex].isCollapsed = false;
                    $scope.editScenarioState.threadIndex = threadIndex;
                    $scope.editScenarioState.commentIndex = commentIndex;

                }
                else if (threadIndex != -1) {
                    $scope.scenario.threads[threadIndex].isEditable = true;
                    $scope.scenario.threads[threadIndex].isCollapsed = false;
                    $scope.editScenarioState.threadIndex = threadIndex;
                    $scope.editScenarioState.commentIndex = commentIndex;
                }

                if (threadIndex == -1 && commentIndex == -1) {
                    getAllComments();
                }
                resettingDeleteConfirmation();
                gotToReplyTextScenario(threadIndex, commentIndex, 'edit');
                clearReplyState();
                clearEditState();

            }

            var clearScenarioEditState = function () {

                if ($scope.editScenarioState.threadIndex != -1 && $scope.editScenarioState.commentIndex != -1) {
                    $scope.scenario.threads[$scope.editScenarioState.threadIndex].thread.comments[$scope.editScenarioState.commentIndex].isEditable = false;

                }
                else if ($scope.editScenarioState.threadIndex != -1 && $scope.editScenarioState.threadIndex != undefined) {
                    $scope.scenario.threads[$scope.editScenarioState.threadIndex].isEditable = false;
                }
                $scope.enterComments = false;
            }

            var clearScenarioReplyState = function () {
                if ($scope.replyScenarioState.threadIndex != -1) {
                    $scope.scenario.threads[$scope.replyScenarioState.threadIndex].reply = false;
                }
                $scope.enterComments = false;
            }

            $scope.replyScenario = function (threadIndex) {
                clearScenarioReplyState();
                clearScenarioEditState();
                if (threadIndex != -1) {
                    $scope.scenario.threads[threadIndex].reply = true;
                    $scope.replyScenarioState.threadIndex = threadIndex;
                }

                resettingDeleteConfirmation();
                gotToReplyTextScenario(threadIndex, -1, 'reply');
                clearReplyState();
                clearEditState();
            }

            $scope.deleteThreadInScenario = function (index,replyIndex) {
                resettingDeleteConfirmation();
                $scope.showScenarioDeleteConfirm[index] =true;
                $scope.replyScenarioIndex=replyIndex;
            };

            $scope.reSettingDeleteMessageScenario=function(parentIndex){
                for(var i=0;i<$scope.showScenarioDeleteConfirm.length;i++){
                    $scope.showScenarioDeleteConfirm[i]=false;
                }
            }

            $scope.deleteThreadFromScenario=function(index, threadId,msg) {
                $scope.noComments='No Comments Found.';
                if (msg == 'Yes') {
                    $scope.showScenarioDeleteConfirm[index] =false;
                    ScenarioCommentService.deleteScenarioThread.delete({
                        scenarioId: $scope.scenarioId,
                        threadId: threadId
                    }, function (response) {
                        $scope.getAllComments();
                        //   $scope.spliceThread(response, threadId);
                        $scope.editScenarioState = {threadIndex: -1, commentIndex: -1};
                        $scope.replyScenarioState = {threadIndex: -1};
                    });
                    if (index != -1 && $scope.scenario.threads[index] != undefined) {
                        $scope.scenario.threads[index].isCollapsed = false;
                    }
                }else{
                    resettingDeleteConfirmation();

                }
            };
            function gotToReplyText(stepindex,threadIndex, commentIndex, type) {
                threadIndex = threadIndex != -1 ? threadIndex : 0;
                if (type == 'reply') {
                    $location.hash('replyText_Scenario_'+threadIndex);
                }
                if (type == 'edit') {
                    if (commentIndex == -1) {
                        $location.hash('anchor_Scenario_'+stepindex+'_' + threadIndex);
                    } else {
                        $location.hash('anchor_Scenario_'+stepindex+'_' + threadIndex + '_' + commentIndex);
                    }
                }
            };

            $scope.deleteReplyScenario = function (parentIndex, index, threadId, commentId, msg) {
                if (msg == 'Yes') {
                    $scope.showScenarioDeleteConfirm[parentIndex, index] = false;
                    CommentService.deleteReplyThread.delete({
                        threadId: threadId,
                        commentId: commentId
                    }, function (response) {
                        $scope.getAllComments(parentIndex);
                        //      $scope.spliceThread(response, threadId);
                        $scope.editScenarioState = {threadIndex: -1, commentIndex: -1};
                        $scope.replyScenarioState = {threadIndex: -1};
                    });
                    if (parentIndex != -1 && $scope.scenario.threads[parentIndex] != undefined) {
                        $scope.scenario.threads[parentIndex].isCollapsed = false;
                    }
                } else {
                    resettingDeleteConfirmation();
                }
            };
            function resettingDeleteConfirmation(){

                for(var i=0;i<$scope.showScenarioDeleteConfirm.length;i++){
                    $scope.showScenarioDeleteConfirm[i]=false;
                }

                for(var i=0;i<$scope.showDeleteConfirm.length;i++){
                    $scope.showDeleteConfirm[i]=false;
                }

            };

            $scope.close = function () {
                getScenarioNewComment(scenarioId);
                $modalInstance.dismiss('cancel');
            };
          /*  $scope.deleteScenarioReply = function (stepIndex, parentIndex, index, threadId, commentId,msg) {
                if (msg=='Yes') {
                    $scope.showDeleteConfirm[parentIndex]=false;
                    CommentService.deleteReplyThread.delete({
                        threadId: threadId,
                        commentId: commentId
                    }, function (response) {
                        $scope.getAllComments(parentIndex);
                        //$scope.spliceThread(stepIndex, response, threadId);
                        $scope.editState = {threadIndex: -1, commentIndex: -1};
                        $scope.replyState = {threadIndex: -1};
                    });

                }else{
                    for(var i=0;i<$scope.showDeleteConfirm.length;i++){
                        $scope.showDeleteConfirm[i]=false;
                    }
                }




            };
*/
        }]];
});

