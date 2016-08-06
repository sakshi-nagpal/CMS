'use strict';

define([],function(){

    return(['changePassword',['$compile', '$templateCache', '$http', function($compile, $templateCache, $http){

        function link(scope, element) {

            var $modalParent = element.parents('.topbar-main');
            $modalParent.append($compile($templateCache.get('changePassword.client.directive.html'))(scope));

            function showSuccessMessage () {
                scope.successMessage = {
                    type : 'success',
                    title : 'Success',
                    body : {
                        message : 'Password has been successfully updated.'
                    }
                };

                //BR-1455 removing scrollbar from body when consecutively bootstrap modals open
                $modalParent.find('.alert-modal').on('shown.bs.modal', function (e) {
                    $("body").addClass("modal-open");
                });
            }

            element.bind('click', function () {
                $modalParent.find('.change-password').modal('show');
            });

            scope.error = null;
            scope.passwordDetails = {};

            scope.changeUserPassword = function () {
                scope.error = null;

                $http.post('/users/password', scope.passwordDetails).success(function () {

                    scope.error = null;
                    scope.passwordDetails = null;
                    $modalParent.find('.change-password').modal('hide');
                    scope.showModal = true;
                    showSuccessMessage();

                }).error(function (response) {
                    scope.error = response.message;
                });
            };

            scope.resetModal = function () {
                scope.error = null;
                scope.passwordDetails = null;
            };
        }

        return{
            restrict:'A',
            link: link
        };

    }]]);
});
