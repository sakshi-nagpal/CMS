'use strict';

define([
        'angularUiBootstrapTpls',
        './controllers/file.scenario.popup.client.controller',
        './controllers/viewBox.scenario.client.controller',
        './controllers/project.document.popup.controller',
        './services/document.client.service',
        './services/document.category.service',
        '../modules/common/services/confirm.popup.service',
        './directives/viewBox.scenario.document.directive',
        './filters/objectOrderByFilter',
        'ngFileUpload',
        'ngFileUploadShim',
        'appModule'
    ],

    function (uiBootstrap, documentController, viewBoxController, projectController, documentService, documentCategoryService, confirmPopupService,
              documentViewDirective, orderByFilter) {

        ApplicationConfiguration.registerModule('document', ['ngFileUpload', 'ui.bootstrap']);

        var module = angular.module('document');

        module.controller(documentController[0], documentController[1]);
        module.controller(viewBoxController[0], viewBoxController[1]);
        module.controller(projectController[0], projectController[1]);
        module.factory(documentService[0], documentService[1]);
        module.factory(documentCategoryService[0], documentCategoryService[1]);
        module.factory(confirmPopupService[0], confirmPopupService[1]);
        module.directive(documentViewDirective[0], documentViewDirective[1]);
        module.filter(orderByFilter[0], orderByFilter[1]);
    });
