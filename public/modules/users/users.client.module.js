'use strict';

define(['./controllers/authentication.client.controller',
        './services/users.client.service',
        'appModule'],
    function (authenticationController, userService) {

    // Use Applicaion configuration module to register a new module
        var userModule = ApplicationConfiguration.registerModule('users');

       userModule.factory(userService[0], userService[1]);
       userModule.controller(authenticationController[0], authenticationController[1]);

    });
