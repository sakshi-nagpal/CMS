'use strict';

define ([
], function() {
    return ['SimulationService',['$resource', function ($resource) {

        return {
            getConfigForRole:$resource('/sim5config/options/role/:role',{role:'@role'}),
            launch:$resource('/sim5config/launch',{env:'@env',friendlyId:'@friendlyId'})
        };
    }]];
});
