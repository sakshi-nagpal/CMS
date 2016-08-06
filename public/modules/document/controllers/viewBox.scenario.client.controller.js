'use strict';
define([], function () {
    return ['viewBoxScenarioController', ['$scope', '$stateParams', 'DocumentCategoryService', '$modal',
        function ($scope, $stateParams, DocumentCategoryService, $modal) {

            $scope.visible = true;

            $scope.itemCount = {value: 0};

            $scope.$watch('scenario', function () {
                updateFileItems();
            });

            function updateFileItems() {
                $scope.itemCount.value = 0;
                if ($scope.scenario !== undefined) {
                    DocumentCategoryService.get("scenario", $scope.scenario.taskId, function (categories) {
                        $scope.fileItems = DocumentCategoryService.getMissingDocs($scope.scenario, categories);
                        $scope.fileItems.forEach(function (fileItem) {
                            if (fileItem.file.length > 0) {
                                $scope.itemCount.value += fileItem.file.length;
                            }
                            else if (fileItem.category.notifications) {
                                $scope.itemCount.value++;
                            }
                        });
                    });
                }
            };

            $scope.collapse = function () {
                $scope.visible = !$scope.visible
            };

            $scope.download = function (id, category) {

                if (id !== undefined) {
                    document.location = '/downloadFile/scenario/' + $scope.scenario._id + '/category/'
                        + category._id + '/file/' + id;
                }
            };

            $scope.showPopup = function () {
                var modalInstance = $modal.open({
                    animation: true,
                    templateUrl: "/modules/document/views/scenario.file.client.view.html",
                    controller: "ScenarioDocumentController",
                    size: 'lg',
                    keyboard: false,
                    backdrop: 'static',
                    resolve: {
                        title: function () {
                            return "Scenario Documents";
                        },
                        contentId: function () {
                            return $stateParams.taskId;
                        },
                        scenario: function () {
                            return $scope.scenario;
                        },
                        itemCount: function () {
                            return $scope.itemCount;
                        }
                    }
                });
                modalInstance.result.then(function (result) {
                    callback(result);
                }, function () {
                    updateFileItems();
                });
            };

        }]];
})
