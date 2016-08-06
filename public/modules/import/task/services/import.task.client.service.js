'use strict';
define([], function () {
    return ['importTaskService', ['$resource', '$stateParams', function ($resource, $stateParams) {

        return {
            copyScenario:$resource('scenarios/:friendlyId/source/:sourceFriendlyId/copy',
                {friendlyId: '@friendlyId', sourceFriendlyId: '@sourceFriendlyId', includeAttachments: '@includeAttachments'}, {'update': {method: 'PUT'}}),
            importStep:$resource('scenarios/:friendlyId/source/:sourceFriendlyId/import/step/:stepId',
                {friendlyId: '@friendlyId', sourceFriendlyId: '@sourceFriendlyId', stepId: '@stepId'}, {'update': {method: 'PUT'}}),
            importLibraryStep:$resource('scenarios/:friendlyId/import/step/:stepId',
                {friendlyId: '@friendlyId', stepId: '@stepId'}, {'update': {method: 'PUT'}})
        };
    }]];
});
