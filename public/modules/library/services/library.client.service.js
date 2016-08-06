'use strict';

define ([
], function() {
    return ['libraryService',['$resource', function ($resource) {

        return {
            createLibraryStep:$resource('library/step/create'),
            libraryStepById:$resource('library/step/:libraryStepId'),
            updateLibraryStepById : $resource('library/step/:libraryStepId',{libraryStepId: '@libraryStepId'},{update:{'method':'PUT'}}),
            libraryStepsBySkillId:$resource('library/skill/id/:skillId/steps'),
            mappedStepDetails : $resource('library/step/:libraryStepId/mapped/tasks',{}, {'query':  {method:'GET', isArray: true}}),
            addMappedStepDetails : $resource('library/step/:libraryStepId/mapped/add',{libraryStepId: '@libraryStepId'},{update:{'method':'PUT'}}),
            updateSkillsForLibraryStep:$resource('library/step/:libraryStepId/skills', {libraryStepId:'@libraryStepId' },{ 'update' : {method:'PUT'} })
        };
    }]];
});
