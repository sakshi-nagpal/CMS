'use strict';
define([],function(){

    return(['alertModal',['$compile', '$templateCache', 'TaskSearch', '$stateParams', '$sce', function($compile, $templateCache, TaskSearch, $stateParams, sce){

        function link(scope, element) {
            scope.sce = sce;
            var $modalParent = element.parent();
            $modalParent.append($compile($templateCache.get('alertModal.client.directive.html'))(scope));

            element.bind('click', function () {
                $modalParent.find('.alert-modal').modal('show');
            });

            scope.callback = function (event) {
                event();
            };

            scope.dismissModal = function () {
                $('body').removeClass('modal-open');
                $modalParent.find('.alert-modal').modal('hide');
            };

            scope.$watch('showModal', function(showModal) {
                scope.showModal = showModal;
                if(showModal) $modalParent.find('.alert-modal').modal('show');
                scope.showModal = false;
            });
        }

        return{
            restrict:'A',
            link:link,
            scope: {
                alertModal : '=',
                showModal : '=?'            //optional: alert-modal opens when passed true
            }
        };

    }]]);
});
