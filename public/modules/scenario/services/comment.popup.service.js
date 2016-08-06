define([], function () {
    return ['CommentPopupService', ['$modal',
        function ($modal) {
            return {
                showStepPopup: function (title, stepIndex, scenarioId, stepId, stepNewCommentCountArray,callback) {
                    var confirmModalInstance = $modal.open({
                        animation: true,
                        draggable: true,
                        windowClass: 'large-Modal',
                        keyboard: true,
                        backdrop: false,
                        controller:'CommentsController',
                        templateUrl: '/modules/comments/views/comments.client.view.html',
                        resolve: {
                            title: function () {
                                return title+''+stepIndex;
                            },
                            stepIndex: function () {
                                return stepIndex-1;
                            },
                            scenarioId: function () {
                                return scenarioId;
                            },
                            stepId: function () {
                                return stepId;
                            },
                            stepNewCommentCountArray: function () {
                                return stepNewCommentCountArray;
                            }
                        }
                    });
                    confirmModalInstance.result.then(function (result) {
                        callback(result);
                    }, function () {
                    });
                }
            };
        }]]
})
;
