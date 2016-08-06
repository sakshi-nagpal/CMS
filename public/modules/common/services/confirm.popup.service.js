define([], function () {
    return ['ConfirmPopupService', ['$modal',
        function ($modal) {
            return {
                showConfirm: function (title, message, callback) {
                    var confirmModalInstance = $modal.open({
                        animation: true,
                        keyboard: false,
                        backdrop: 'static',
                        templateUrl: '/modules/common/views/confirm.popup.client.view.html',
                        controller: function confirmController($scope, $modalInstance) {
                            confirmController.$inject = ['$scope', '$modalInstance'];
                            $scope.title = title;
                            $scope.message = message;

                            $scope.ok = function () {
                                $modalInstance.close(true);
                            };

                            $scope.close = function () {
                                $modalInstance.close(false);
                            };
                        },
                        resolve: {
                            title: function () {
                                return title;
                            },
                            message: function () {
                                return message;
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
