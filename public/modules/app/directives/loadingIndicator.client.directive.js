'use strict';
define([], function() {
    return['loadingIndicator',['$rootScope', function($rootScope) {
        function link($scope) {

            $scope.isLoading= false;
            $rootScope.$on('$stateChangeStart', function (e,toState) {
                if (!toState.loadingIconRequired && toState.loadingIconRequired !== false) {
                    $scope.isLoading = true;
                }
            });
            $rootScope.$on('showLoader', function () {
                $scope.isLoading = true;
            });
            $rootScope.$on('hideLoader', function () {
                $scope.isLoading = false;
            });
        }

            return {
                restrict: 'E',
                template: '<div class="loading-indicator" ng-if="isLoading"> </div>',
                link: link
            };

    }]];
});

