'use strict';

define ([
], function() {

    return ['stepViewer',['$sce','$timeout', function (sce, $timeout) {
        return {
            restrict: 'E',
            scope : {
                stepJson: '=',
                stepIndex: '=',
                getViewerHeight: '&',
                isLibrary: '=?',
                changeMethodStatus: '&',
                manageMethodStatus: '=?',
                mappedStep :'=?'
            },
            templateUrl: 'stepViewerDirective.client.view.html',
            controller: function($element,$scope) {
                $scope.sce = sce;
                function updateStepContainerHeight(){
                    var viewerHeight = $scope.getViewerHeight();
                    $element.find('.step-container').outerHeight(viewerHeight);
                    setHiddenContainerDimensions();
                    $element.find('.step-container').scroll();
                }

                function setHiddenContainerDimensions(){
                    var helperDiv = $('<div />');
                    $element.find('.step-container').append(helperDiv);
                    var width = helperDiv.outerWidth();
                    $element.find('.step-text-hidden').css('width', width);
                    $element.find('.step-text-hidden').css('height', $element.find('.step-text').height());

                    $element.find('.step-text-hidden-container').css('top', -$element.find('.step-text-hidden-container').outerHeight()-10);
                    helperDiv.remove();
                }

                if($scope.getViewerHeight() !== undefined){
                    $timeout(function() {updateStepContainerHeight();});
                    $(window).on('resize',updateStepContainerHeight);
                }
                $scope.$emit('hideLoader');

                setHiddenContainerDimensions();

                $element.find('.step-container').scroll(function() {
                    var y = $(this).scrollTop();
                    var hiddenContainer = $element.find('.step-text-hidden-container');

                    if (y > hiddenContainer.outerHeight() + 20 && hiddenContainer.data('animation-type') !== 'show') {
                        hiddenContainer.data('animation-type','show');
                        hiddenContainer.animate({
                            top: '0'
                        }, 200);

                    } else if(y <= hiddenContainer.outerHeight() + 20  && hiddenContainer.data('animation-type') !== 'hide'){
                        hiddenContainer.data('animation-type','hide');
                        hiddenContainer.animate({
                            top: -hiddenContainer.outerHeight()-10
                        }, 180);
                    }
                });

                $scope.onMethodStatusChange = function(id, status){
                    $scope.changeMethodStatus({id:id,status:status});
                };

            }
        };
    }]];

});
