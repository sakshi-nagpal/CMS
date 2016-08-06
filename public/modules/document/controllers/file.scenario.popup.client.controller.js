'use strict';

define([], function () {

        return ['ScenarioDocumentController', ['$scope', '$rootScope', 'Upload', 'title', 'contentId', 'scenario', 'itemCount',
            'DocumentService', 'DocumentCategoryService', 'ConfirmPopupService', '$modalInstance', '$timeout', '$filter',
            function ($scope, $rootScope, Upload, title, contentId, scenario, itemCount,
                      DocumentService, DocumentCategoryService, ConfirmPopupService, $modalInstance, $timeout, $filter) {
                $scope.fileItems = [];
                $scope.title = title;
                $scope.showDownloadAll = false;
                $scope.checkAll = false;
                $scope.showAlertMsg = false;

                $scope.uploadItems = [];

                DocumentCategoryService.get("scenario", contentId, function (categories) {
                    $scope.categories = categories;
                    $scope.categories.forEach(function (category) {
                        category.disabled = false;
                    });
                    $scope.fileItems = DocumentCategoryService.getMissingDocs(scenario, $scope.categories);
                    addDateAndSelectFields();
                });

                $scope.isAllowed = function (category) {
                    var isAllowed = false;
                    category.allowedPhases.filter(function (phase) {
                        if (phase === scenario.phase.code) {
                            isAllowed = true;
                        }
                    });
                    return isAllowed;
                };

                function addDateAndSelectFields() {
                    $scope.fileItems.forEach(function (document) {
                        document.file.forEach(function (file) {
                            file.select = false;
                            var dateTime = new Date(file.timeStamp);
                            file.timeStampDisplay = dateTime.toLocaleString();
                        });
                    });
                }

                $scope.alerts = [];
                $scope.closeAlert = function (index) {
                    $scope.alerts.splice(index, 1);
                };

                $scope.cancelUpload = function (uploadValue, categoryId) {
                    if (uploadValue) {
                        addAlertMassage('danger', 'File Upload Cancelled!', categoryId);
                        uploadValue.abort();
                    }
                };

                $scope.fileDropped = function (files, category) {
                    if (files.length > 0) {
                        var checkAllowAmount = DocumentCategoryService.checkAllowAmount($scope.fileItems, category._id, files);

                        if (checkAllowAmount) {
                            var isValid = DocumentCategoryService.isValid($scope.fileItems, category._id);
                            var isFileSizeExceded = DocumentCategoryService.isFileSizeExceded(category, files);
                            if (!isFileSizeExceded) {
                                if (category.allowedAmount === 1) {
                                    category.disabled = true;
                                }
                                if (isValid) {
                                    upload(files, category);
                                }
                                else {
                                    ConfirmPopupService.showConfirm('Replace', 'Are you sure you want to replace existing file?', function (moveAhead) {
                                        if (moveAhead) {
                                            upload(files, category);
                                        }
                                        else {
                                            category.disabled = false;
                                        }
                                    });
                                }

                            } else {
                                addAlertMassage('danger', 'File size exceeds the limit!', category._id);
                            }
                        }
                        else {
                            addAlertMassage('danger', category.displayName + ' will allow only one file to upload ', category._id);
                        }
                    }
                };

                function addNewUpload(event, progressPercentage, category) {
                    if ($filter('filter')($scope.uploadItems, event.config.fields.timeStamp).length === 0) {

                        if ($scope.uploadItems.length > 3) {
                            $scope.uploadItems.splice(0, 1);
                        }

                        $scope.uploadItems.push({
                            timeStamp: event.config.fields.timeStamp,
                            showProgress: true,
                            percentage: progressPercentage,
                            cancel: event.config.__XHR,
                            filename: event.config.file.name,
                            categoryId: category._id
                        });
                    }
                    else {
                        var itemIndex = $scope.uploadItems.map(function (element) {
                            return element.timeStamp;
                        }).indexOf(event.config.fields.timeStamp);
                        $scope.uploadItems[itemIndex].percentage = progressPercentage;
                    }
                }

                function removeUpload(timeStamp) {
                    var itemIndex = $scope.uploadItems.map(function (element) {
                        return element.timeStamp;
                    }).indexOf(timeStamp);
                    if (itemIndex >= 0) {
                        $scope.uploadItems.splice(itemIndex, 1);
                    }
                }

                function addAlertMassage(type, message, categoryId) {
                    $scope.showAlertMsg = true;
                    $scope.alerts.push({
                        type: type,
                        msg: message,
                        doctypeid: categoryId
                    });
                }

                var upload = function (files, category) {
                    if (files !== null) {
                        uploadFile(files, category, 0);
                    }
                };

                var uploadFile = function (files, category, index) {

                    if (index < files.length) {
                        var uploadValue = Upload.upload({
                            url: '/document/content/' + contentId + '/scenario/' + scenario._id + '/category/' + category._id,
                            fields: {timeStamp: new Date().getTime() + index},
                            file: files[index]
                        }).progress(function (evt) {
                                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                                addNewUpload(evt, progressPercentage, category);
                                console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
                            }
                        ).success(function (data, status, headers, config) {
                                $timeout(function () {
                                    removeUpload(config.fields.timeStamp);
                                }, 1000);
                                DocumentCategoryService.pushFileToCategory($scope.fileItems, data, category._id);
                                if (!category.notifications) {
                                    itemCount.value++;
                                }
                                category.disabled = false;
                                addAlertMassage('success', 'File Uploaded Successfully!', category._id);
                                $rootScope.$broadcast('documentUpdate');
                                addDateAndSelectFields();
                            }).error(function (data, status, headers, config) {
                                removeUpload(config.fields.timeStamp);
                                category.disabled = false;
                                if (!isMessageExists) {
                                    addAlertMassage('danger', 'File Upload Failed!', category._id);
                                }
                            });

                        uploadValue.then(function (success, error, progress) {
                        }).catch(function (error) {
                            addAlertMassage('danger', error.data.message, category._id);
                        }).finally(function () {
                            index += 1;
                            uploadFile(files, category, index);
                        });
                    }
                };

                function isMessageExists(categoryId) {
                    var index = -1;
                    index = $scope.alerts.map(function (alert) {
                        return alert.doctypeid
                    }).indexOf(categoryId);

                    return (index != 1);
                }

                $scope.download = function (id, category) {
                    if (id !== undefined) {
                        document.location = '/downloadFile/scenario/' + scenario._id + '/category/'
                            + category._id + '/file/' + id;
                    }
                };

                $scope.downloadAll = function () {
                    var fileIds = [];
                    $scope.fileItems.forEach(function (document) {
                        document.file.forEach(function (file) {
                            if (file.select) fileIds.push({fileId: file._id, code: document.category.code});
                        });
                    });

                    if (fileIds.length > 0) {
                        DocumentService.downloadScenarioFiles.save({
                            scenario: scenario._id
                        }, fileIds, function (response) {
                            document.location = '/downloadFiles/' + response.fileName + '?fileName='
                                + scenario.friendlyId + '&nocache=' + (new Date()).getTime();
                            $modalInstance.dismiss('cancel');
                        });
                    }
                };

                $scope.deleteFile = function (fileId, category) {
                    $scope.selectAll(false);
                    if (fileId !== undefined) {
                        ConfirmPopupService.showConfirm('Delete', 'Are you sure you want to delete this file permanently?', function (moveAhead) {
                            if (moveAhead) {
                                DocumentService.deleteFile.delete({
                                    scenario: scenario._id,
                                    fileId: fileId,
                                    category: category._id
                                }, function () {
                                    DocumentCategoryService.removeFile($scope.fileItems, fileId);
                                    if (!category.notifications) {
                                        itemCount.value--;
                                    }
                                    $rootScope.$broadcast('documentUpdate');
                                    addAlertMassage('danger', 'File Deleted Successfully!', category._id);
                                });
                            }
                        });
                    }
                    $scope.showAlertMsg = false;
                };

                $scope.selectAll = function (select) {
                    if ($scope.fileItems != null) {
                        for (var i = 0; i < $scope.fileItems.length; i++) {
                            for (var j = 0; j < $scope.fileItems[i].file.length; j++) {
                                $scope.fileItems[i].file[j].select = select;
                            }
                        }
                    }
                    $scope.toggleDownloadAll(select);
                };

                $scope.toggleDownloadAll = function (select) {
                    $scope.showDownloadAll = false;
                    if (select) {
                        $scope.checkAll = true;
                        for (var i = 0; i < $scope.fileItems.length; i++) {
                            for (var j = 0; j < $scope.fileItems[i].file.length; j++) {
                                $scope.showDownloadAll = true;
                                if (!$scope.fileItems[i].file[j].select) {
                                    $scope.checkAll = false;
                                    return;
                                }
                            }
                        }
                    }
                    else {
                        $scope.checkAll = false;
                        for (var i = 0; i < $scope.fileItems.length; i++) {
                            for (var j = 0; j < $scope.fileItems[i].file.length; j++) {
                                if ($scope.fileItems[i].file[j].select) {
                                    $scope.showDownloadAll = true;
                                    return;
                                }
                            }
                        }
                    }
                };

                $scope.close = function () {
                    if ($scope.uploadItems.length == 0) {
                        $scope.categories = [];
                        $modalInstance.dismiss('cancel');
                    }
                };

            }
        ]];
    }
)
