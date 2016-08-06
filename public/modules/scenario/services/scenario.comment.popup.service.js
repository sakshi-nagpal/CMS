define([], function () {
    return ['ScenarioCommentPopupService', ['$modal',
        function ($modal) {
            return {
                showScenarioModal: function (title,scenarioId,scenarioNewCommentCount) {
                    var confirmModalInstance = $modal.open({
                        animation: true,
                        draggable: true,
                        windowClass:'large-Modal-scenario',
                        keyboard:true,
                        backdrop:false,
                        controller:'ScenarioCommentsController',
                        templateUrl: '/modules/comments/views/scenario.comments.client.view.html',
                        resolve: {
                            title: function () {
                                return title;
                            },
                            scenarioId: function () {
                                return scenarioId;
                            },
                            scenarioNewCommentCount: function () {
                                return scenarioNewCommentCount;
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
