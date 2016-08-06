'use strict';

define([
        'stepEditorDirective',
        'ngCkeditorDirective',
        'captureKeydownDirective',
        'appModule'
    ],

    function (stepEditorDirective, ngCkeditor, captureKeydownDirective) {

        ApplicationConfiguration.registerModule('stepEditor');

        var module = angular.module('stepEditor');
        module
            .directive(stepEditorDirective[0], stepEditorDirective[1])
            .directive(ngCkeditor[0], ngCkeditor[1])
            .directive(captureKeydownDirective[0], captureKeydownDirective[1]);
    });
