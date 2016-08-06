'use strict';

define ([
], function() {
    return ['Step',['$resource', function ($resource) {
        return {
            getStep: $resource('scenarios/:friendlyId/steps/:stepIndex',{friendlyId: '@friendlyId',stepIndex:'@stepIndex'}),
            scenarioStep: $resource('scenarios/:friendlyId/steps/:stepId',{friendlyId: '@friendlyId',stepId: '@_id', isAutoSave: '@autoSave'}, { 'update' : {method:'PUT'} }),
            getScenarioMethodTypes: $resource('steps/methodTypes',{}, {'query':  {method:'GET', isArray: true, cache: true}}),
            scenarioSiblings: $resource('scenarios/:friendlyId/siblings',{friendlyId: '@friendlyId', hasSteps:true}),
            createStep: $resource('scenarios/:scenarioId/steps',{scenarioId: '@scenarioId'}),
            getStepNumber:$resource('scenarios/:friendlyId/steps/id/:stepId/index',{friendlyId: '@friendlyId',stepId:'@stepId'}),
            getScenarioNewCommentCount: $resource('/threads/count/scenario/:scenarioId',{scenarioId: '@scenarioId'}),
            methodStatus:$resource('scenarios/:friendlyId/method/:methodId/status/:methodStatus',{friendlyId: '@friendlyId',methodId:'@methodId',methodStatus:'@methodStatus'}, { 'update' : {method:'PUT'} })
                
        };

    }]];
});
