'use strict';
define([], function() {
   return ['breadcrumbs', function() {
       return {
           restrict: 'E',
           replace: true,
           scope: {
                breadcrumbs: '='
           },
           templateUrl: 'breadcrumb.client.directive.html'
       };
   }];
});
