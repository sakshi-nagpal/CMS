'use strict';
define([], function () {
    return ['ComparisonService', ['$resource', function ($resource) {

        return {
            getEntityRevisions: $resource('/history/entity/:entityId/revisions', {entityId:'@entityId',historyIds :'@historyIds'},{query:{method:'GET', isArray : true}})
        };
    }]];
});
