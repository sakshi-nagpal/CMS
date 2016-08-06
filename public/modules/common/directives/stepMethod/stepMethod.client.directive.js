'use strict';

define ([
], function() {
    return ['stepMethod',['$sce','$timeout', function (sce,$timeout) {
        return {

            restrict: 'E',
            scope : {
                methods: '=',
                manageMethodStatus: '=?',
                changeMethodStatus: '&?'
            },
            templateUrl: 'stepMethodDirective.client.view.html',
            link: function(scope,$element) {

                scope.$on('stepJsonRefreshed', function (event) {
                    $timeout(function(){
                        $element.find('.method-status').selectpicker('refresh');
                        $element.find('.method-status .dropdown-toggle').attr('title',function( i, val ) {
                            return scope.capitalize(val);
                        });
                    },0);
                });

                scope.capitalize = function(string) {
                    return string.charAt(0).toUpperCase() + string.slice(1);
                }
            },
            controller: function($element,$scope,$timeout) {
                $scope.manage = {methodStatus:false};
                $timeout(function(){
                    $element.find('.method-status').selectpicker('refresh');
                    $element.find('.method-status .dropdown-toggle').attr('title',function( i, val ) {
                        return $scope.capitalize(val);
                    });
                },0);
                $scope.$watch('methods', function() {
                    $scope.methodCountKeyMap = {};
                });
                $scope.methodCountKeyMap = {};
                $scope.sce = sce;
                //Update the method count key map
                $scope.updateMethodCountKeyMap = function(type){
                    if($scope.methodCountKeyMap.hasOwnProperty(type)){
                        ++$scope.methodCountKeyMap[type];
                    }else{
                        $scope.methodCountKeyMap[type] = 1;
                    }
                    return $scope.methodCountKeyMap[type];
                };
                $scope.onMethodStatusChange = function(id, status){console.log(id,'all Stepmethod',status)
                    $scope.changeMethodStatus({id:id,status:status})
                }
                $scope.$emit('hideLoader');
            }
        };
    }]];

});
