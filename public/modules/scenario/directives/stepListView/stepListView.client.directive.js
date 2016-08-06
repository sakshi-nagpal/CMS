'use strict';
define(['modules/common/util/movable'
],function(){

    return(['stepListView',['$sce','$timeout', function(sce, $timeout){

        function controller($scope, $element) {

            this.makeStepsMovable = function() {
                var sourceStepIndex = null;
                //initialize method dragging
                $element.movable({
                    maxDepth: 1,
                    listNodeName: 'div',
                    itemNodeName: 'div',
                    rootClass: 'step-list-view',
                    listClass: 'step-list',
                    itemClass: 'scenario-step',
                    placeClass: 'stepPlaceHolder',
                    dragClass: 'stepDragEl',
                    handleClass: 'dd-step-handle',
                    containment: $element.find('.step-list'),
                    $parent: $element,
                    isStepDrag: true,
                    gripperIconDragClass: 'gripper-icon-drag',
                    gripperIcon: '<span class="gripper-icon-drag baloo-font baloo-icon-gripper-lg"></span>'
                }).on({
                    'dragStart': function(event, dragStartIndex) {
                        sourceStepIndex = dragStartIndex;
                    },
                    'change': function(event, dragEndIndex) {
                        if(sourceStepIndex !== null && sourceStepIndex !== dragEndIndex) {
                         $scope.$apply(function() {
                         $scope.reorderSteps({id: $scope.steps[sourceStepIndex]._id, index: dragEndIndex});
                         var sourceStep = $scope.steps.splice(sourceStepIndex, 1);
                         $scope.steps.splice(dragEndIndex, 0, sourceStep[0]);

                         var sourceSkill = $scope.skillLabel.splice(sourceStepIndex, 1);
                         $scope.skillLabel.splice(dragEndIndex, 0, sourceSkill[0]);
                         });
                         sourceStepIndex = null;
                         }
                    }
                });
            };

        }

        function link(scope, element, attrs, ctrl) {
            scope.sce = sce;
            scope.isMethodsMovable = false;
            scope.$watch('steps', function(steps) {
                scope.steps = steps;
                if(scope.steps) {
                    if(!scope.isMethodsMovable) {
                        ctrl.makeStepsMovable();
                        scope.isMethodsMovable = true;
                    }
                    //for skill labels of step and tooltip
                    scope.skillLabel=[];
                    scope.steps.forEach(function(step,i){
                        var tempLabel=[];
                        step.skills.forEach(function(skill,j){
                            tempLabel[j] = skill.title;
                        });
                        scope.skillLabel[i]=tempLabel.join(', ');
                    });
                }
            });

            function updateStepContainerHeight(){
                var viewerHeight = scope.getViewerHeight();
                element.find('.step-container').outerHeight(viewerHeight);
            }
            if(scope.getViewerHeight() !== undefined){
                $timeout(function() {updateStepContainerHeight();});
                $(window).on('resize',updateStepContainerHeight);
            }

        }

        return{
            restrict: 'E',
            controller: controller,
            link: link,
            replace: true,
            require: 'stepListView',
            scope: {
                'steps' : '=',
                'onStepClick': '&',
                'tagSkill' : '&',
                'reorderSteps' : '&',
                'viewOnly' : '=?',
                'getViewerHeight': '&',
                'phase': '=',
                'commentDrop': '&',
                'getStepNewComment':'&',
                'stepNewCommentCount':'='
            },
            templateUrl: 'stepListView.client.directive.html'
        };

    }]]);
});
