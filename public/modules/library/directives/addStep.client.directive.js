'use strict';
define([],function(){

    return(['addStep',['$compile', '$templateCache','libraryService','$state','$stateParams','$timeout','$filter','$sce',
        function($compile, $templateCache, libraryService, $state, $stateParams, $timeout, $filter,sce){

            function link(scope, element) {

                var $eleParent = element.parent();
                $eleParent.append($compile($templateCache.get('addStep.client.directive.html'))(scope));
                var modal = $eleParent.find('.add-step-modal');

                scope.sce = sce;
                modal.on("hidden.bs.modal",function(){
                    scope.libStepName = '';
                    scope.errorMsg = '';

                });

                modal.on('shown.bs.modal', function() {
                    $(this).find('input:first').focus();
                });

                scope.saveLibraryStep = function(){
                    if(!scope.libStepName) {
                        scope.errorMsg = $filter('translate')('library.addStepModal.label_addStep_error_blank_message');
                    }
                    else {
                        libraryService.createLibraryStep.save({},
                            {stepName: scope.libStepName, stepData : scope.stepData}, function(step){
                                $state.go(scope.addStepPopupConfig.endPoint,{'id' : step._id , 'app': $stateParams.app, config :scope.stateConfig});
                            },function(err){
                                scope.errorMsg = $filter('translate')('library.addStepModal.label_addStep_error_message');
                            }
                        );
                    }
                };

            }

            return{
                restrict:'E',
                link:link,
                scope: {
                    addStepPopupConfig : '=?',
                    stepData : '=',
                    stateConfig : '='
                }
            };

        }]]);
});



