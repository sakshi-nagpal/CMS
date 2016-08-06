'use strict';

define ([
], function(lunr) {

    return ['DataTransformer', [function () {
        return{
            transformData : function(data) {
                var count = 0;
                data.forEach(function(obj) {
                    obj.index = count;
                    Object.keys(obj).forEach(function(key) {
                        if(typeof obj[key] === 'object') {
                            Object.keys(obj[key]).forEach(function(val) {
                                obj[key+''+val] = obj[key][val];
                            });
                        }

                    });
                    count++;
                });
                return data;
            }
        };
    }]];
    }
);
