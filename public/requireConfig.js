'use strict';

if (window.__karma__) {
    var allTestFiles = [];
    var TEST_REGEXP = /.client.*.test\.js$/;
    var pathToModule = function (path) {
        return path.replace(/^\/base\/public\//, '').replace(/\.js$/, '');
    };
    Object.keys(window.__karma__.files).forEach(function (file) {
        if (TEST_REGEXP.test(file)) {
            // Normalize paths to RequireJS module names.
            allTestFiles.push(pathToModule(file));
        }
    });
}

// Config added by grunt-requirejs-config
require.config({

    "waitSeconds": 60,
    baseUrl: window.__karma__ ? '/base/public' : window.appBaseURL,
    deps: window.__karma__ ? allTestFiles : [],
    callback: window.__karma__ ? window.__karma__.start : null,
    "map": {
        "*": {
            "css": "requireCSS",
            "text": "requireText"
        }
    },
    packages: [

        {
            name: "appModule",
            location: 'modules/app',
            main: "app.client.module"
        },
        {
            name: "dashboardModule",
            location: 'modules/dashboard',
            main: "dashboard.client.module"
        },
        {
            name: "userModule",
            location: 'modules/users',
            main: "users.client.module"
        },
        {
            name: "contentModule",
            location: "modules/content",
            main: "content.client.module"
        },
        {
            name: "scenarioModule",
            location: "modules/scenario",
            main: "scenario.client.module"
        },
        {
            name: "documentModule",
            location: 'modules/document',
            main: "document.client.module"
        },
        {
            name: "skillTaggingModule",
            location: "modules/skillLibrary/tagging",
            main: "skillTagging.client.module"
        },
        {
            name: "skillLibraryModule",
            location: "modules/skillLibrary",
            main: "skill.client.module"
        },
        {
            name: "stepModule",
            location: "modules/step",
            main: "step.client.module"
        },
        {
            name: "stepViewerModule",
            location: "modules/step/stepViewer",
            main: "stepViewer.client.module"
        },
        {
            name: "stepEditorModule",
            location: 'modules/step/stepEditor',
            main: "stepEditor.client.module"
        },
        {
            name: "skillImportModule",
            location: "modules/skillLibrary/import",
            main: "skillImport.client.module"
        },
        {
            name: "skillBrowseModule",
            location: "modules/skillLibrary/browse",
            main: "skillBrowse.client.module"
        },
        {
            name:"importModule",
            location: 'modules/import',
            main: "import.client.module"
        },
        {
            name: "importTaskModule",
            location: 'modules/import/task',
            main: "importTask.client.module"
        },
        {
            name: "reportsModule",
            location: 'modules/reports',
            main: "reports.client.module"
        },
        {
            name: "historyModule",
            location: 'modules/history',
            main: "history.client.module"
        },
        {
            name: "commentsModule",
            location: 'modules/comments',
            main: "comments.client.module"
        },
        {
            name: "libraryStepModule",
            location: 'modules/library/step',
            main: "library.step.client.module"
        },
        {
            name: "libraryStepViewerModule",
            location: 'modules/library/step/viewer',
            main: "library.step.viewer.client.module"
        },
        {
            name: "libraryStepEditorModule",
            location: 'modules/library/step/editor',
            main: "library.step.editor.client.module"
        },
        {

            name: "historyComparisonModule",
            location: 'modules/history/comparison',
            main: "history.comparison.client.module"
        }

    ],

    "modules": [
        /*  {
         "name": "lib"
         },
         {
         "exclude": [
         "lib"
         ],
         "name": "appModule"
         },
         {
         "exclude": [
         "lib"
         ],
         "name": "dashboardModule"
         },
         {
         "exclude": [
         "lib"
         ],
         "name": "userModule"
         }*/
    ],

    "paths": {
        angular: 'lib/angular/angular.min',
        angularResource: 'lib/angular-resource/angular-resource.min',
        angularAnimate: 'lib/angular-animate/angular-animate.min',
        angularUiRouter: 'lib/angular-ui-router/release/angular-ui-router.min',
        angularUIUtils: 'lib/angular-ui-utils/ui-utils.min',
        angularMocks: 'lib/angular-mocks/angular-mocks',
        angularTranslate: 'lib/angular-translate/angular-translate.min',
        angularTranslateLoaderStaticFiles: 'lib/angular-translate-loader-static-files/angular-translate-loader-static-files.min',
        ocLazyLoad: 'lib/ocLazyLoad/dist/ocLazyLoad.min',
        jQuery: 'lib/jquery/dist/jquery.min',
        lib: 'lib',
        appConfig: 'config',
        routerDecorator: 'modules/app/utils/router-decorator',
        owlCarousel: 'lib/owl-carousel/owl-carousel/owl.carousel.min',
        bootstrapSelect: 'lib/bootstrap-select/dist/js/bootstrap-select.min',
        bootstrap: 'lib/bootstrap/dist/js/bootstrap.min',
        constants: 'constants',
        breadcrumbs: 'modules/app/directives/breadcrumbs/breadcrumb.client.directive',
        ellipsisTooltip: 'modules/app/directives/ellipsisTooltip.client.directive',
        optionsModal: 'modules/app/directives/optionsModal/optionsModal.client.directive',
        productChooser: 'modules/app/directives/productChooser/productChooser.client.directive',
        stepListView: 'modules/scenario/directives/stepListView/stepListView.client.directive',
        placeholders: 'lib/placeholders/dist/placeholders.min',
        catalogService: 'modules/app/services/catalog.client.service',
        productService: 'modules/app/services/product.client.service',
        ngFileUpload: 'lib/ng-file-upload/ng-file-upload.min',
        ngFileUploadShim: 'lib/ng-file-upload/ng-file-upload-shim.min',
        jQueryNotific8: 'lib/jquery-notific8/dist/jquery.notific8.min',
        angularUIGrid: 'lib/angular-ui-grid/ui-grid.min',
        scenarioService: 'modules/scenario/services/scenario.client.service',
        stepService: 'modules/step/services/step.client.service',
        stepHeader: 'modules/step/directives/stepHeader.client.directive',
        userCan:'modules/app/directives/userAuthorization/authorization.client.directive',
        lunr : 'lib/lunr.js/lunr.min',
        lunrIndexWebWorker : 'modules/skillLibrary/common/services/textSearch/lunrIndexWebWorker',
        textSearch : 'modules/skillLibrary/common/services/textSearch/textSearch.client.service',
        uiRouterExtras:'lib/ui-router-extras/release/ct-ui-router-extras.min',
        skillLibraryService :'modules/skillLibrary/common/services/skillLibrary.client.service',
        dataTransformer : 'modules/app/utils/data.transformer.client.service',
        uiDataGrid :'modules/common/directives/uiDataGrid/uiDataGrid.client.directive',
        stateChooser :'modules/common/directives/stateChooser/stateChooser.client.directive',
        angularLocalStorage: 'lib/angular-local-storage/dist/angular-local-storage.min',
        notificationService :'modules/common/services/notification.client.service',
        commentPopupService:'modules/scenario/services/comment.popup.service',
        autoResizer :'modules/common/directives/autoResizer.client.directive',
        reSizerService :'modules/common/services/reSizer.client.service',
        stepMethod:'modules/common/directives/stepMethod/stepMethod.client.directive',
        importTaskService :'modules/import/task/services/import.task.client.service',
        angularUiBootstrap: 'lib/angular-bootstrap/ui-bootstrap.min',
        angularUiBootstrapTpls: 'lib/angular-bootstrap/ui-bootstrap-tpls.min',
        alertModal:'modules/common/directives/alertModal/alertModal.client.directive',
        addStep : 'modules/library/directives/addStep.client.directive',
        libraryService : 'modules/library/services/library.client.service',
        stepViewerDirective:'modules/step/stepViewer/directives/stepViewer.client.directive',
        stepEditorDirective :'modules/step/stepEditor/directives/stepEditor.client.directive',
        ngCkeditorDirective :'modules/step/stepEditor/directives/ngCkeditor/ngCkeditor.client.directive',
        captureKeydownDirective: 'modules/step/stepEditor/directives/captureKeydown.client.directive',
        moment: 'lib/moment/min/moment.min',
        angularMoment: 'lib/angular-moment/angular-moment.min',
        ngScroll:'modules/comments/directives/scroll.view.client.directive',
        'ckEditor':'modules/step/stepEditor/directives/ngCkeditor/ckeditor/dev/builder/release/ckeditor/ckeditor',
        'jqueryScrollIntoView' : 'modules/step/stepEditor/directives/ngCkeditor/jQuery.scrollIntoView/jquery.scrollIntoView',
        'googleDiffMatchPatch':"lib/google-diff-match-patch/diff_match_patch_uncompressed",
        bootstrapDateRangePicker: 'lib/bootstrap-daterangepicker/daterangepicker',
        daterangepicker: 'lib/angular-daterangepicker/js/angular-daterangepicker'
    },
    "shim": {
        "lib": {
            "deps": [
                'angular',
                'angularResource',
                'angularAnimate',
                'angularUiRouter',
                'angularUIUtils',
                'angularTranslate',
                'angularTranslateLoaderStaticFiles',
                'ocLazyLoad',
                'routerDecorator',
                'jQuery',
                'bootstrap',
                'bootstrapSelect',
                'owlCarousel',
                'placeholders',
                'jQueryNotific8',
                'uiRouterExtras',
                'angularUiBootstrapTpls',
                'googleDiffMatchPatch'
            ]
        },
        "angular": {
            exports: "angular",
            "deps": [
                "jQuery"
            ]
        },
        "angularResource": {
            "deps": [
                "angular"
            ]
        },
        'googleDiffMatchPatch': {
            exports: 'diff_match_patch'
        },
        "angularAnimate": {
            "deps": [
                "angular"
            ]
        },
        "angularUiRouter": {
            "deps": [
                "angular"
            ]
        },
        "angularUIUtils": {
            "deps": [
                "angular"
            ]
        },
        "angularTranslate": {
            "deps": [
                "angular"
            ]
        },
        "angularUIGrid": {
            "deps": [
                "angular"
            ]
        },
        "angularTranslateLoaderStaticFiles": {
            "deps": [
                "angularTranslate"
            ]
        },
        "ocLazyLoad": {
            "deps": [
                "angular"
            ]
        },
        "templates": {
            "deps": [
                "lib"
            ]
        },
        "routes": {
            "deps": [
                "lib",
                'constants'
            ]
        },
        "constants": {
            "deps": [
                "lib"
            ]
        },
        "angularMocks": {
            "deps": [
                "lib"
            ]
        },
        "routerDecorator": {
            "deps": [
                'angularUiRouter',
                'ocLazyLoad'
            ]
        },
        "userModule": {
            "deps": [
                'appModule'
            ]
        },
        "dashboardModule": {
            "deps": [
                'appModule'
            ]
        },
        "documentModule": {
            "deps": [
                'appModule', 'ngFileUpload', 'ngFileUploadShim', 'angularUiBootstrapTpls'
            ]
        },
        "contentModule": {
            "deps": [
                'appModule'
            ]
        },
        "scenarioModule": {
            "deps": [
                'appModule'
            ]
        },
        "stepModule": {
            "deps": [
                'appModule'
            ]
        },
        "stepEditorModule": {
            "deps": [
                'appModule'
            ]
        },
        "stepViewerModule": {
            "deps": [
                'appModule'
            ]
        },
        "skillTaggingModule": {
            "deps": [
                'appModule'
            ]
        }, "skillImportModule": {
            "deps": [
                'appModule'
            ]
        },
        "skillBrowseModule": {
            "deps": [
                'appModule'
            ]
        },
        "skillLibraryModule": {
            "deps": [
                'appModule'
            ]
        },
        "importModule": {
            "deps": [
                'appModule'
            ]
        },
        "importTaskModule": {
            "deps": [
                'appModule'
            ]
        },
        "reportsModule": {
            "deps": [
                'appModule'
            ]
        },
        "historyModule": {
            "deps": [
                'appModule'
            ]
        },
        "libraryStepModule": {
            "deps": [
                "angular"
            ]
        },
        "libraryStepViewerModule": {
            "deps": [
                "angular"
            ]
        },
        "libraryStepEditorModule": {
            "deps": [
                'appModule'
            ]
        },
        "historyComparisonModule": {
            "deps": [
                'appModule'
            ]
        },
        "commentsModule": {
            "deps": [
                'appModule', 'moment', 'angularMoment', 'angularUiBootstrapTpls','ngScroll'
            ]
        },
        'owlCarousel': {
            'deps': [
                'jQuery'
            ]
        },
        'bootstrap': {
            'deps': [
                'jQuery'
            ]
        },
        'bootstrapSelect': {
            'deps': [
                'jQuery',
                'bootstrap'
            ]
        },
        'daterangepicker':{
            'deps': [
                'angular'
            ]
        },
        'bootstrapDateRangePicker': {
            'deps': [
                'jQuery',
                'bootstrap',
                'moment'
            ]
        },
        "catalogService": {
            "deps": [
                "angular"
            ]
        },
        "productService": {
            "deps": [
                "angular"
            ]
        },
        "jQueryNotific8": {
            "deps": [
                "jQuery"
            ]
        },
        "scenarioService": {
            "deps": [
                "angular"
            ]
        }, "stepService": {
            "deps": [
                "angular"
            ]
        },
        "uiRouterExtras": {
            "deps": [
                "angular",
                "angularUiRouter"
            ]
        },
        "ngFileUpload": {
            "deps": [
                "angular"
            ]
        },
        "ngFileUploadShim": {
            "deps": [
                "angular"
            ]
        },
        "angularUiBootstrap": {"deps": ['angular']},
        "angularUiBootstrapTpls": {"deps": ['angular', 'angularUiBootstrap']},
        "angularMoment": {"deps": ['angular', 'moment']},
        "ngScroll": {"deps": ['angular']}
    }
});

if (!window.__karma__) {
    require(['appModule']);
}
