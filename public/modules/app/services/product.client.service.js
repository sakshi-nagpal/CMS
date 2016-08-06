'use strict';

define ([
], function() {
    return ['Products',['$resource', function ($resource) {
        return $resource('product', {},
            {
                'query':  {method:'GET', isArray: true, cache: true}
            });
    }]];
});
