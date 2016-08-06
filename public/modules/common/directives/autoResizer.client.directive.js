'use strict';
define([],function(){

    return(['autoResizer',['reSizer',function(reSizer){

        function link(scope, element, attrs) {
            /* return if autoresizer has been removed */
            if(attrs['autoResizer'] == 'false'){
                return;
            }

            var totalHeight;
            scope.reSizer = reSizer;
            totalHeight = scope.reSizer.getUpdatedHeight();
            var availableHeight = totalHeight - (parseInt(scope.fixedHeight) || 0);
            element.css('height',availableHeight);

            var fixedHeightEvent = scope.$watch('fixedHeight',function (newValue, oldValue) {
                if ( newValue !== oldValue ) {
                    totalHeight = scope.reSizer.getUpdatedHeight();
                    var availableHeight = totalHeight - (parseInt(scope.fixedHeight) || 0);
                    element.css('height',availableHeight);
                }
            });

            var resizerUpdatedHeightEvent = scope.$watch('reSizer.getUpdatedHeight()',function (newValue, oldValue) {
                if ( newValue !== oldValue ) {
                    totalHeight = newValue;
                    availableHeight = totalHeight - (parseInt(scope.fixedHeight) || 0);
                    element.css('height',availableHeight);
                }
            });

            scope.$on('$destroy', function(){
                totalHeight = null;
                fixedHeightEvent();
                resizerUpdatedHeightEvent();
                element.remove();
                element.empty();
                element = null;
            });
        }

        return{
            restrict:'A',
            link:link
        };

    }]]);


});


//$scope.fixedHeight should be given
