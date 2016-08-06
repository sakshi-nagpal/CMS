'use strict';

define([
    'lib',
    'config',
    'templates',
    'routes',
    './controllers/header.client.controller',
    './services/authentication.client.service',
    './services/role.client.service',
    './directives/scrollToTop.client.directive',
    './directives/keyboardNavigation.client.directive',
    './services/storage.client.service',
    'constants',
    './directives/loadingIndicator.client.directive',
    'breadcrumbs',
    'ellipsisTooltip',
    'optionsModal',
    'productChooser',
    './services/taskSearch.client.service',
    './services/authorization.client.service',
    './directives/userAuthorization/authorization.client.directive',
    './directives/changePassword/changePassword.client.directive',
    'notificationService',
    'stepMethod',
    'alertModal'
], function(a,b,c,d, headerController,authenticationFactory,roleService,scrollToTopDirective,keyboardNavigationDirective, storageService,constatns,
            loadingIndicatorDirective, breadcrumbsDirective, ellipsisTooltipDirective, optionsModalDirective,
            productChooserDirective,taskSearchService, authorizationService, authorizationDirective, changePasswordDirective, notificationService,stepMethodDirective, alertModalDirective) {

    //Start by defining the main module and adding the module dependencies
    var appModule = angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);
    appModule.factory(authenticationFactory[0], authenticationFactory[1]);
    appModule.service(roleService[0], roleService[1]);
    appModule.controller(headerController[0], headerController[1]);
    appModule.directive(scrollToTopDirective[0], scrollToTopDirective[1]);
    appModule.factory(authorizationService[0], authorizationService[1]);
    appModule.directive(authorizationDirective[0], authorizationDirective[1]);
    appModule.service(storageService[0], storageService[1]);
    appModule.directive(keyboardNavigationDirective[0], keyboardNavigationDirective[1]);
    appModule.service(storageService[0], storageService[1]);
    appModule.directive(loadingIndicatorDirective[0], loadingIndicatorDirective[1]);
    appModule.directive(ellipsisTooltipDirective[0], ellipsisTooltipDirective[1]);
    appModule.directive(optionsModalDirective[0], optionsModalDirective[1]);
    appModule.directive(productChooserDirective[0], productChooserDirective[1]);
    appModule.directive(breadcrumbsDirective[0], breadcrumbsDirective[1]);
    appModule.service(taskSearchService[0],taskSearchService[1]);
    appModule.directive(stepMethodDirective[0],stepMethodDirective[1]);
    appModule.directive(alertModalDirective[0],alertModalDirective[1]);
    appModule.directive(changePasswordDirective[0],changePasswordDirective[1]);
    appModule.factory(notificationService[0], notificationService[1]);
    appModule.config(['$stateProvider', '$locationProvider', '$ocLazyLoadProvider', '$urlRouterProvider', '$translateProvider', function ($stateProvider, $locationProvider, $ocLazyLoadProvider, $urlRouterProvider, $translateProvider) {

        $locationProvider.hashPrefix('!');

        $ocLazyLoadProvider.config({
            loadedModules: [ApplicationConfiguration.applicationModuleName],
            asyncLoader: require
        });

        $urlRouterProvider.otherwise('/');

        $translateProvider.useStaticFilesLoader({
            prefix: window.appBaseURL + '/locale/',
            suffix: '.json'
        });

        $translateProvider.preferredLanguage('en');

        //$locationProvider.html5Mode(true);
    }]);

    appModule.run(['$location', '$state', '$rootScope', 'Authentication', 'Authorization', function ($location, $state, $rootScope, Authentication, Authorization) {

        $rootScope.previousURL = '/';
        $rootScope.authentication = Authentication;
        $rootScope.authorization = Authorization;
        $rootScope.capabilities = Authorization.capabilities;
        $rootScope.appVersion = window.appVersion;

        $rootScope.baseURL = window.appBaseURL;

        $rootScope.$on('$locationChangeStart', function (event, next, current) {

            if (!Authentication.user && $location.path() !== '/user/signin' && $location.path().indexOf('/skill_analysis') < 0) {
                $rootScope.previousURL = $location.path();
                $location.path('/user/signin').replace();
            }
            if ($location.path() === '/user/signup' && !(Authentication.user && Authentication.user.roles.indexOf('systemAdmin') !== -1)) {
                $location.path('/').replace();
            }
        });
        $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {

            var fullScreen = (toParams && toParams.fullScreen) ? toParams.fullScreen : false;
            $rootScope.isPopupMode = fullScreen;
            //call service method to check authorization
            //if user is unauthorized, call event.preventDefault()
            var allowedCababilities = (toState && toState.allowedCapabilities) ? toState.allowedCapabilities : null;

            if (allowedCababilities && !Authorization.canAccess(allowedCababilities)) {
                if (fromState.name === '' || fromState.name === 'users.signin') {
                    $location.path('/').replace();
                }
                else {
                    event.preventDefault();
                    toState.loadingIconRequired = false;
                }
            }
        });
    }]);

    //Then define the init function for starting up the application
    angular.element(document).ready(function () {
        //Fixing facebook bug with redirect
        if (window.location.hash === '#_=_')
            window.location.hash = '#!';
        angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName]);

    });

});

