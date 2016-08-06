'use strict';

define ([
], function() {
    return ['Catalogs',['$resource', function ($resource) {
        return $resource('catalog', {});
    }]];
});
