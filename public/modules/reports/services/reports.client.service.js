'use strict';
define([], function () {
    return ['Reports', ['$resource', function ($resource) {
        return  {
            getSeries: $resource('series/all',{},{query:{method:'GET', isArray : true}}),
            exportSeries : $resource('export/series/:id',{id : '@id'}, {query:{method :'GET'}}),
            exportSeriesPathway: $resource('export/series/:id/pathway', {id : '@id'},{query:{method:'GET'}}),
            getTaskBySeries: $resource('export/series/task/:id', {id : '@id'},{query:{method:'GET'}}),
            getTaskByInput: $resource('export/task/data',{inputJson: '@inputJson'}, {query:{method:'GET', cache: false}}),
            scenariosExists :$resource('export/scenarios/exists',{inputJson: '@inputJson'}, {query:{method :'GET'}})
        };
    }]];
});

