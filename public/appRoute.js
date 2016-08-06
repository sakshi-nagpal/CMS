
'use strict';

angular.module("routes", ["ConstantsModule",'ct.ui.router.extras']);

angular.module('routes').config(['$httpProvider','Constants','$stickyStateProvider',
    function($httpProvider,Constants,$stickyStateProvider) {
        // $stickyStateProvider.enableDebug(true);
        // Set the httpProvider "not authorized" interceptor
        $httpProvider.interceptors.push(['$q', '$location', 'Authentication', '$window',
            function($q, $location, Authentication,$window) {
                return {
                    responseError: function(rejection) {
                        switch (rejection.status) {
                            case 401:
                                // Deauthenticate the global user
                                Authentication.user = null;
                                // Redirect the application
                                $window.location.reload();
                                break;
                            case 403:
                                // Add unauthorized behaviour
                                break;
                        }

                        return $q.reject(rejection);
                    }
                };
            }
        ]);
    }
]);
