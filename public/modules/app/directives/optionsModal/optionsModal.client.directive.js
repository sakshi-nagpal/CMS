'use strict';
define([],function(){

    return(['optionsModal',['$compile', '$templateCache', 'TaskSearch', '$stateParams', function($compile, $templateCache, TaskSearch, $stateParams){

        function link(scope, element) {

            var $modalParent = element.parent();
            $modalParent.append($compile($templateCache.get('optionsModal.client.directive.html'))(scope));

            element.bind('click', function () {
                $modalParent.find('.options-modal').modal('show');
            });

            scope.dismissModal = function () {
                $('body').removeClass('modal-open');
                $modalParent.find('.options-modal').modal('hide');
            };

            scope.successCB = function () {
                scope.optionsModal.taskSearchText = null;
                $modalParent.find('.options-modal').modal('hide');
            };

            scope.searchTask = function (taskSearchText, stateRef, stepNum) {
                TaskSearch.checkIfFriendlyIdExists(taskSearchText, scope.successCB, stateRef, $stateParams.friendlyId, stepNum);
            };

            scope.callback = function (event,data) {
                scope.$emit(event,data);
            };
        }

        return{
            restrict:'A',
            link:link,
            scope: {
                optionsModal : '='
            }
        };

    }]]);
});
