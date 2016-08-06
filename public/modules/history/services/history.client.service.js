'use strict';
define([], function () {
    return ['historyService', ['$resource', function ($resource) {

        return {
            getEntityHistory: $resource('/history/entity/:id', {id: '@id'},{query:{method:'GET', isArray : true}})
        };
    }]];
});
