'use strict';

// Authentication service for user variables
define([], function () {

    angular.module('ConstantsModule', []);

    angular.module('ConstantsModule')
        .constant('Constants', {
            'MODULES': {
                'dashboard': 'dashboard',
                'users': 'users',
                'content': 'content'
            },
            'STEP':{
                'TASK': 'TASK',
                'LIBRARY': 'LIBRARY',
                'SCENARIO': 'SCENARIO'
            }
        });
});

