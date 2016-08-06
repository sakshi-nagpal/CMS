'use strict';
define([], function () {
    return ['ContentService', ['$resource', '$stateParams', function ($resource, $stateParams) {

        var transformData = function (data) {
            var resultJson = {};
            angular.forEach(data, function (obj) {
                resultJson[obj._id] = obj.value;
            });
            return resultJson;
        };

        var transformPhaseData = function (data) {
            var resultJson = {};
            angular.forEach(data, function (obj) {
                for (var i in obj.data) {
                    resultJson[obj._id + obj.data[i].type] = {};
                    resultJson[obj._id + obj.data[i].type].phase = obj.data[i].phase;
                    resultJson[obj._id + obj.data[i].type].id = obj.data[i].id;
                    resultJson[obj._id + obj.data[i].type].count = obj.data[i].count;
                    resultJson[obj._id + obj.data[i].type].isCommentAvailable = obj.data[i].isCommentAvailable;
                }
            });
            return resultJson;
        };

        return {
            childCountByType: $resource('series/:seriesId/parent/:parentType/child/:childType/count',
                {seriesId: '@seriesId', parentType: '@parentType', childType: '@childType'},
                {
                    query: {
                        method: 'GET', transformResponse: function (data) {
                            return transformData(angular.fromJson(data));
                        }
                    }
                }),
            taskPhases: $resource('series/:seriesId/element/:elementId/task/phases',
                {seriesId: '@seriesId', elementId: '@elementId'},
                {
                    query: {
                        method: 'GET', transformResponse: function (data) {
                            return transformPhaseData(angular.fromJson(data));
                        }
                    }
                }),
            taskById: $resource('task/:taskId', {taskId: '@taskId'}, {update: {method: 'PUT'}}),
            scenarioReference: $resource('project/:projectId/scenario/reference',
                {projectId: '@projectId'}),
            status: $resource('task/:taskId/isActive/:isActive',
                {taskId: '@taskId', isActive: '@isActive'}, {'update': {method: 'PUT'}}),
            updatePhase: $resource('chapter/:elementId/update/phase/:phaseCode', {
                elementId: '@elementId',
                phaseCode: '@phaseCode'
            })
        };
    }]];
});
