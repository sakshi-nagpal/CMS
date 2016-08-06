'use strict';

define ([
], function() {
    return ['Role',['$resource', function ($resource) {

        return {

           roleDescByRoleName: $resource('/user/roles', {},
             {
             'query': {method: 'POST', isArray: true, cache: true}
             })
        };
    }]];
});

