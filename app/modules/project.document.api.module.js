'use strict';

var mongoose = require('mongoose'),
    fileApi = require('./file.save.api.server.module');

exports.updateProjectDocument = function (project, scenarioType, category, file, callback) {

    project.getAncestors({type: 'cms_series'}, '_id', function (errParent, series) {

            if (errParent) {
                console.log(errParent);
                return callback(errParent);
            }

            var fileLocation = series[0]._id + '/' + 'project-docs/' + project._id + '/' + scenarioType.code;

            var categoryIndex, scenarioTypeIndex;
            var fileId;

            scenarioTypeIndex = getScenarioTypeIndex(project, scenarioType.code);
            if (scenarioTypeIndex != undefined) {
                categoryIndex = getCategoryIndex(project, category._id, scenarioTypeIndex);
            }

            if (categoryIndex != undefined) {
                if (category.allowedAmount == '1') {
                    fileId = project.data.documents[scenarioTypeIndex].documents[categoryIndex].files[0];
                    project.data.documents[scenarioTypeIndex].documents[categoryIndex].files = [];
                }
            }
            else if (scenarioTypeIndex != undefined) {
                project.data.documents[scenarioTypeIndex].documents.push({category: category, files: []});
                categoryIndex = project.data.documents[scenarioTypeIndex].documents.length - 1;
            }
            else {
                project.data.documents.push({scenarioType: scenarioType, documents: [{category: category, files: []}]});
                scenarioTypeIndex = project.data.documents.length - 1;
                categoryIndex = project.data.documents[scenarioTypeIndex].documents.length - 1;
            }

            fileApi.save(file, fileLocation, function (err, fileDb) {
                if (err) return callback(err);
                try {
                    project.data.documents[scenarioTypeIndex].documents[categoryIndex].files.push(fileDb);
                    updateProject(project);
                    if (fileId != undefined) {
                        removeFile(fileId);
                    }
                }
                catch (err) {
                    callback(err);
                }

                callback(null, fileDb);
            });
        }
    )
}
;

function getScenarioTypeIndex(project, scenarioCode) {
    var mainIndex;
    for (var index = 0; index < project.data.documents.length; index++) {
        if (project.data.documents[index].scenarioType.code == scenarioCode) {
            mainIndex = index;
        }
    }
    return mainIndex;
}

function getCategoryIndex(project, categoryId, scenarioTypeIndex) {
    var mainIndex;
    for (var index = 0; index < project.data.documents[scenarioTypeIndex].documents.length; index++) {
        if (project.data.documents[scenarioTypeIndex].documents[index].category == categoryId) {
            mainIndex = index;
        }
    }
    return mainIndex;
}

function updateProject(project) {
    project.save(function (err, docs) {
        if (err) {
            throw new err;
        }
    });
}

function removeFile(fileId) {
    fileApi.removeFile(fileId, function (err) {
        if (err) throw new err;
    });
}

exports.removeDocumentFromProject = function (project, scenarioCode, categoryId, fileId, callback) {
    var categoryIndex, scenarioTypeIndex;
    var fileId;

    scenarioTypeIndex = getScenarioTypeIndex(project, scenarioCode);
    categoryIndex = getCategoryIndex(project, categoryId, scenarioTypeIndex);
    fileId = project.data.documents[scenarioTypeIndex].documents[categoryIndex].files[0];

    try {
        removeFile(fileId);
        project.data.documents[scenarioTypeIndex].documents[categoryIndex].files = [];
        if (project.data.documents[scenarioTypeIndex].documents.length == 1) {
            project.data.documents[scenarioTypeIndex].documents = [];
            if (project.data.documents.length == 1) {
                project.data.documents = [];
            }
            else {
                project.data.documents.splice(scenarioTypeIndex, 1);
            }
        }
        else {
            project.data.documents[scenarioTypeIndex].documents.splice(categoryIndex, 1);
        }
        updateProject(project);
    }
    catch (err) {
        return callback(err);
    }

    callback(null);
};

