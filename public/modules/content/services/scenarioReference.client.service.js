'use strict';

define([], function () {
    return ['ScenarioReferenceService', ['ContentService','$filter', '$q', function (ContentService, $filter, $q) {


        function getScenarioReferences(projectId) {
            return $q(function (resolve, reject) {
                ContentService.scenarioReference.get({projectId: projectId}, function (scenarioReferences) {
                    resolve(scenarioReferences);
                });
            });
        }

        return {
            get: function (projectId, callback) {
                var promise = getScenarioReferences(projectId);
                promise.then(function (scenarioReferences) {
                    callback(scenarioReferences);
                }, function (err) {
                    console.log(err);
                });
            },

            post: function (projectId, scenarioRefObj) {
                ContentService.scenarioReference.save({projectId: projectId}, scenarioRefObj);
            }
        };
    }]];
});
