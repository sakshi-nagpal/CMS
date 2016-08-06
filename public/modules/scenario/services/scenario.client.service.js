'use strict';

define ([
], function() {
    return ['TaskScenario',['$resource', '$filter', function ($resource, $filter) {
        var transformErrorJson = function(errorJson) {
            var errorArray = [];

            if(errorJson.hasOwnProperty('task')) errorArray.push({message : 'common.phaseTransitionErrorMessages.noStep'});

             if(errorJson.hasOwnProperty('steps')) {
                var steps = errorJson['steps'];
                for (var key in steps) {               //key is stepIndex
                    var step = steps[key];
                    var list = [];
                    if(step.hasOwnProperty('blankStep')) list.push({message : 'common.phaseTransitionErrorMessages.blankStep'});
                    if(step.hasOwnProperty('noMethod')) list.push({message : 'common.phaseTransitionErrorMessages.noMethod'});
                    if(step.hasOwnProperty('blankAction')) {
                        var blankActionMessage = $filter('translate')('common.phaseTransitionErrorMessages.blankAction');
                        step['blankAction'].forEach(function(methodIndex) {
                            list.push({message : $filter('translate')('common.label.label_method') + ' ' + methodIndex + ': ' + blankActionMessage})
                        });
                    }
                    if(step.hasOwnProperty('blankAction')) {
                        var blankActionLength = step['blankAction'].length - 1;
                    }
                    if (list.length) errorArray.push({message : $filter('translate')('common.label.label_step') +' ' + key + ': ' + (Object.keys(step).length + (blankActionLength || 0)) + ' error(s)', list : list});
                    blankActionLength = 0;
                }
            }

            if(errorJson.hasOwnProperty('requiredDocuments')){
                var list = [];
                for(var requiredDoc in errorJson['requiredDocuments']) {
                    list.push({message : requiredDoc + ' ' + $filter('translate')('common.helpText.is_missing')})
                }
                errorArray.push({message : $filter('translate')('common.label.label_required_documents') + ': ' + Object.keys(errorJson['requiredDocuments']).length + ' error(s)', list : list});
            }
            return errorArray;
        };
        return {
            scenarioByFriendlyIdWithoutActions: $resource('scenarios/:friendlyId', {friendlyId: '@friendlyId', includeActions:false}),
            scenarioByFriendlyIdWithActions: $resource('scenarios/:friendlyId', {friendlyId: '@friendlyId', includeActions:true}),
            scenarioByFriendlyIdWithoutActionsWithTaskData: $resource('scenarios/:friendlyId', {friendlyId: '@friendlyId',
                getTaskData:true, includeActions:false}),
            updateScenario : $resource('scenarios/:friendlyId',{friendlyId: '@friendlyId'},{update:{'method':'PUT'}}),
            updateSkillsForStep:$resource('scenarios/:scenarioId/step/:stepId/skills',
                {scenarioId:'@scenarioId',stepId:'@stepId' },{ 'update' : {method:'PUT'} }),
            scenarioSiblings: $resource('scenarios/:friendlyId/siblings',{friendlyId: '@friendlyId', hasSteps:true}),
            createScenario: $resource('scenarios/:friendlyId'),
            scenariosByTaskId: $resource('task/:taskId/scenarios',{hasSteps:true}),
            updateSteps: $resource('scenarios/:friendlyId/steps/:stepId/index/:stepIndex/reorder',
                {friendlyId: '@friendlyId', stepId: '@stepId', stepIndex: '@stepIndex'},{'update' : {method:'PUT'}}),
            phase : $resource('scenarios/:friendlyId/phase/:phaseCode/transition',
                {friendlyId: '@friendlyId', phaseCode: '@phaseCode'}, {'update' : {method: 'PUT', transformResponse: function (data) {
                    return transformErrorJson(angular.fromJson(data));}, isArray : true}}),
            methodsByStepId:$resource('scenarios/:friendlyId/steps/id/:stepId',{},{'query':{method:'GET',friendlyId: '@friendlyId',stepId: '@stepId'}}),
            getStepNewCommentCount: $resource('threads/count/scenario/:scenarioId/step/:stepId',
                {scenarioId: '@scenarioId', stepId: '@stepId'}),
            getScenarioNewCommentCount: $resource('/threads/count/scenario/:scenarioId',
                {scenarioId: '@scenarioId'}),
            status:$resource('scenarios/:friendlyId/isActive/:isActive',
                {friendlyId: '@friendlyId',isActive:'@isActive'}, { 'update' : {method:'PUT'} })



        };

    }]];
});
