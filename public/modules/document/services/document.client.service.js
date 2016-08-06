define([], function () {
    return ['DocumentService', ['$resource', '$http', function ($resource, $http) {
        return {
            downloadFiles: function (data) {
                return $http({
                    method: 'POST',
                    url: '/downloadFiles',
                    data: data
                });
            },
            downloadScenarioFiles: $resource('/downloadFiles/scenario/:scenario',
                {scenario: '@scenario'}),
            deleteFile: $resource('/document/scenario/:scenario/category/:category/file/:fileId',
                {scenario: '@scenario', fileId: '@fileId', category: '@category'}),
            getElement: $resource('/project/:elementId',
                {elementId: '@elementId'}),
            getSeries: $resource('/element/:elementId/series', {elementId: '@elementId'}),
            deleteProjectFile: $resource('/document/project/:project/scenarioType/:scenarioType/category/:categoryId/file/:fileId',
                {project: '@project', scenarioType: '@scenarioType', categoryId: '@categoryId', fileId: '@fileId'})
        };
    }]]
});

