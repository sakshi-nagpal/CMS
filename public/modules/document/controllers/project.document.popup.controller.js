'use strict';

define([], function () {

    return ['ProjectDocumentController', ['$scope', 'project', 'scenarioTypes', 'DocumentService', 'DocumentCategoryService',
        '$modalInstance',
        function ($scope, project, scenarioTypes, DocumentService, DocumentCategoryService, $modalInstance) {

            $scope.showDownloadAll = false;
            $scope.checkAll = false;
            $scope.title = project.title;
            $scope.scenarioTypes = scenarioTypes;
            $scope.alerts = [];
            $scope.filesExists = false;
            $scope.noDocMsg = '';

            var documents = [];
            var fileItems = [];

            function getFilesForScenarioTypeCategory(documents, scenario, category) {
                var files;
                documents.forEach(function (document) {
                    if (document.scenarioType.code === scenario) {
                        document.documents.forEach(function (documentItem) {
                            if (documentItem.category._id === category) {
                                files = documentItem.files;
                            }
                        });
                    }
                });
                return files;
            }

            DocumentCategoryService.get('cms_project', project._id, function (categories) {
                DocumentService.getElement.get({elementId: project._id}, function (data) {
                    documents = data.data.documents;
                    var fileItem;
                    categories.forEach(function (category) {
                        fileItem = {category: category, items: [], select: false, enable: false};
                        scenarioTypes.forEach(function (scenarioType) {
                            var item = {scenarioType: scenarioType, files: []};
                            var files;
                            if (documents !== undefined) {
                                files = getFilesForScenarioTypeCategory(documents, scenarioType.code, category._id);
                            }
                            if (files !== undefined) {
                                $scope.filesExists = true;
                                $scope.noDocMsg = '';
                                fileItem.enable = true;
                                item.files = files;
                            }
                            fileItem.items.push(item);
                        });
                        fileItems.push(fileItem);
                    });
                    $scope.fileItems = fileItems;
                    if ($scope.filesExists === false) {
                        $scope.noDocMsg = 'No documents available';
                    }
                });

            });

            $scope.selectAll = function (select) {
                if ($scope.fileItems !== null) {
                    $scope.fileItems.forEach(function (fileItem) {
                        if (fileItem.enable) {
                            fileItem.select = select;
                        }
                    });
                }
                $scope.toggleDownloadAll(select);
            };

            $scope.toggleDownloadAll = function (select) {
                $scope.showDownloadAll = false;
                $scope.checkAll = true;
                if ($scope.fileItems !== null) {
                    $scope.fileItems.forEach(function (fileItem) {
                        if (fileItem.enable) {
                            if (!fileItem.select) {
                                $scope.checkAll = false;
                            } else {
                                $scope.showDownloadAll = true;
                            }
                        }
                    });
                }

                if (!$scope.filesExists) {
                    $scope.checkAll = false;
                }
            };

            $scope.downloadAll = function () {
                var fileIds = [];
                $scope.fileItems.forEach(function (fileItem) {
                    if (fileItem.select) {
                        fileItem.items.forEach(function (item) {
                            if (item.files !== undefined && item.files.length > 0)
                                item.files.forEach(function (file) {
                                    fileIds.push(file._id);
                                });
                        });
                    }
                });

                if (fileIds.length > 0) {
                    var zipFileName = project.title.toLowerCase().replace(/ /g, '').replace(/[^a-zA-Z0-9]/g, '').substring(0, 59).trim();
                    DocumentService.downloadFiles(fileIds).success(function (data, status, headers, config) {
                        document.location = '/downloadFiles/' + data.fileName + '?fileName='
                            + zipFileName + '&nocache=' + (new Date()).getTime();
                        $modalInstance.dismiss('cancel');
                    }).error(function (data, status, headers, config) {

                    });
                }
            };

            $scope.download = function (id) {
                if (id !== undefined) {
                    document.location = '/downloadFile/' + id;
                }
            };

            $scope.close = function () {
                $modalInstance.dismiss('cancel');
            };

            $scope.closeAlert = function (index) {
                $scope.alerts.splice(index, 1);
            };
        }]];
})
