define([], function () {
    return ['DocumentCategoryService', ['$filter', '$window', 'DocumentService', '$q',
        function ($filter, $window, DocumentService, $q) {

            function getDocumentCategories(id) {
                return $q(function (resolve, reject) {
                    var documentCategories;
                    DocumentService.getSeries.get({elementId: id}, function (data) {
                        resolve(data.data.documentCategories);
                    });
                });
            }

            return {
                get: function (type, elementId, callback) {
                    var categories;
                    var promise = getDocumentCategories(elementId);
                    promise.then(function (categories) {
                        var selectedCategories;
                        categories.forEach(function (category) {
                            if (category.type == type) {
                                selectedCategories = category.categories;
                                callback(selectedCategories);
                            }
                        });
                    }, function (err) {
                        console.log(err);
                    });
                },
                getMissingDocs: function (scenario, categories) {
                    var isInclude = false;
                    var documents = scenario.documents;
                    categories.forEach(function (category) {
                        if ($filter('filter')(documents, category._id).length == 0) {
                            var files = [];
                            if (category.downloadOnly) {
                                var fileType =
                                    files.push({
                                        _id: "",
                                        originalName: scenario.friendlyId.replace(/\./g, '_') + '_' + category.code + '.xml',
                                        fileSize: 0
                                    });
                            }
                            documents.push({category: category, file: files});
                        }
                    });
                    return documents;
                },
                pushFileToCategory: function (documents, file, category) {
                    documents.forEach(function (document) {
                        if (document.category._id == category) {
                            if (document.category.allowedAmount == '1') {
                                document.file = [];
                            }
                            document.file.push(file);
                        }
                    });
                    return documents;
                },
                isValid: function (documents, category) {
                    var isValid = true;
                    documents.forEach(function (document) {
                        if (document.category._id == category && document.category.allowedAmount == '1' && document.file.length > 0) {
                            isValid = false;
                        }
                    });
                    return isValid;
                },
                checkAllowAmount: function (documents, category, file) {
                    var checkAllowAmount = true;
                    documents.forEach(function (document) {
                        if (document.category._id == category && document.category.allowedAmount != '*' && file.length > document.category.allowedAmount) {
                            checkAllowAmount = false;
                        }
                    });

                    return checkAllowAmount;
                },
                isFileSizeExceded: function (category, files) {
                    var isFileSizeExceded = false;
                    for (var index = 0; index < files.length; index++) {
                        if (category.fileSize < files[index].size) {
                            isFileSizeExceded = true;
                        }
                    }
                    return isFileSizeExceded;
                },
                removeFile: function (documents, fileId) {
                    documents.forEach(function (document) {
                        for (var index = 0; index < document.file.length; index++) {
                            if (document.file[index]._id == fileId) {
                                document.file.splice(index, 1);
                                break;
                            }
                        }
                    });
                }
            };
        }
    ]]
})
;
