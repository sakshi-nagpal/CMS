'use strict';
define([],function(){

    return(['scrollToTop',['$window',function($window){

        function link(scope, element, attrs) {

            angular.element($window).bind('scroll', function() {
                if (this.pageYOffset >= 200) {
                    element.fadeIn();
                } else {
                    element.fadeOut();
                }
            });


            element.bind('click', function(){
                angular.element('html,body').animate({scrollTop:0}, 'fast');
            });

        }

        return{
            restrict:'A',
            link:link
        };

    }]]);


});
