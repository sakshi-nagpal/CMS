'use strict';
define([],function(){

    return(['sim5Launch',['SimulationService','$timeout','$window','$location',function(SimulationService,$timeout, $window, $location){

        function launchURL(friendlyId, env){
            var url = $location.protocol() + '://' + $location.host()  + ":" + $location.port() + '/sim5config/launch?env='+ env;
            if(friendlyId){
                url = url + '&friendlyId='+ friendlyId;
            }
            //$window.open(url,'_blank');
            var ua = navigator.userAgent.toLowerCase();
            if (ua.indexOf('macintosh') !== -1 && ((ua.indexOf('safari') !== -1 && ua.indexOf('chrome') === -1) || ua.indexOf('mozilla') !== -1)) {
                window.open(url, 'SIM5Launch', 'toolbar=no,statusbar=no,resizable=0,addressbar=no,width=' + (screen.availWidth - 90) + ',height= ' + (screen.availHeight - 65) + ',scrollbars=no,top=0,left=0');
            }
            else {
                window.open(url, 'SIM5Launch', 'toolbar=no,statusbar=no,resizable=0,addressbar=no,width=' + (screen.availWidth - 10) + ',height= ' + (screen.availHeight - 65) + ',scrollbars=no,top=0,left=0');
            }
        };
        function link($scope, $element, attrs) {
            $element.bind('click',function(){
                $scope.getSIM5Config(true);
            });
            $scope.onConfigSelect = function(){
                launchURL($scope.friendlyId, $scope.selectedConfig.env);
                $scope.selectedConfig = '';
                $element.find('.simulation').trigger('click');
                $element.find('.simulation').selectpicker('deselectAll');
            };
        };
        function controller($scope, $element, $rootScope){
            $scope.getSIM5Config = function(launch){
                if(!$scope.sim5config){
                    SimulationService.getConfigForRole.query({role:$rootScope.authentication.user.roles[0]}, function(data){
                        $scope.sim5config = data;

                        if(data.length === 1){
                            $scope.selectedConfig = $scope.sim5config[0];
                            if(launch){
                                launchURL($scope.friendlyId, $scope.selectedConfig.env);
                            }
                        }
                        $timeout(function(){
                            $element.find('.simulation').selectpicker('refresh');
                            $element.find('.selectpicker').removeAttr('title');
                            if($scope.sim5config.length === 1){
                                $element.find('.caret').hide();
                            }
                        },0);

                    });
                } else if(launch && $scope.sim5config.length === 1){
                    launchURL($scope.friendlyId, $scope.selectedConfig.env);
                    $timeout(function(){
                        $element.find('div.bootstrap-select').removeClass('open');
                    },0);

                }
            };
            $scope.getSIM5Config();
        };
        return{
            restrict:'A',
            link:link,
            controller: controller,
            templateUrl: 'sim5config.directive.client.view.html',
            transclude: true,
            scope: {
                friendlyId : '='
            }
        };

    }]]);
});
