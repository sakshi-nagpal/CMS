'use strict';
define([],function(){

    return(['productChooser',['$compile', '$templateCache', 'TaskSearch', '$stateParams','$timeout','$state',
        'Products','$filter',
        function($compile, $templateCache, TaskSearch, $stateParams,$timeout,$state,Products,
                 $filter){

        function link(scope, element) {

            scope.$on('onProductClick', function (event,data) {
                scope.callBack({data:data});
            });

            Products.query(function(products){
                scope.products = {
                    'title': $filter('translate')('skillBrowse.label_heading'),
                    data :[],
                    'customClass' : 'product-chooser'
                };
                angular.forEach(products,function(value,key){
                    scope.products.data[key] = {
                        'thumbnail' : products[key].thumbnail,
                        'caption' : products[key].title,
                        'event' : 'onProductClick'
                    };
                });
            });
        }

        return{
            restrict:'A',
            link:link,
            transclude: true,
            scope:{
                callBack:'&'
            },
            templateUrl: 'productChooser.client.directive.html'
        };

    }]]);
});
