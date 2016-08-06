'use strict';
define([], function () {
    return ['Hierarchy', ['$resource', function ($resource) {
        return {
            seriesHierarchy: $resource('series/:seriesId/hierarchy', {seriesId: '@seriesId'}),
            elementHierarchy: $resource('series/:seriesId/element/:elementId/hierarchy', {seriesId: '@seriesId',
                elementId: '@elementId'}),
            elementAncestors: $resource('element/:elementId/ancestors',{elementId: '@elementId'})
        };
    }]];
});
