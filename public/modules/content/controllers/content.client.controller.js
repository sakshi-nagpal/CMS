'use strict';

define([], function () {

    return ['contentController', ['$scope', '$rootScope', '$state', 'contentConstants', '$stickyState', 'ContentService', 'notificationService', '$filter', 'ConfirmPopupService',
        function ($scope, $rootScope, $state, contentConstants, $stickyState, ContentService, notificationService, $filter, ConfirmPopupService) {

            $scope.data = {
                assets: contentConstants.appAssets,
                header: {},
                scenarioTabs: {},
                // set header title and icon
                setHeaderInfo: function (header) {
                    for (var key in header) {
                        $scope.data.header[key] = header[key];
                    }
                },

                // set tabs as per screen
                setHeaderTabs: function (screen) {     // screen can series, element or task
                    $scope.data.tabs = contentConstants.tabsData[screen];
                },

                setContentType: function (contentType) {
                    $scope.data.contentType = contentType;
                },

                setElementId: function (elementId) {
                    $scope.data.elementId = elementId;
                },

                getTaxonomyByProperty: function (taxonomies, entities, type) {
                    return $.grep(taxonomies, function (e) {
                        return e[entities] === type;
                    });
                }
            };
            $scope.$on('$destroy', function () {       //to destroy Sticky State
                $stickyState.reset('content');
            });

            $scope.phases = window.phases;

            $scope.setPhaseChanger = function () {
                if (contentConstants.phaseControl.indexOf($scope.data.contentType) > -1) {
                    return true;
                }
                else {
                    return false;
                }
            };

            $scope.phaseChange = {showModal: false};
            var setSelectedPhase = function () {
                $scope.selectedPhase = {code: '-1', name: '--Select--'};
            };

            setSelectedPhase();

            $scope.changePhase = function (phase) {
                ConfirmPopupService.showConfirm('Phase change alert', 'Are you sure you want to change phase of all the Scenarios to ' + phase.name,
                    function (result) {
                        if (result) {
                            $scope.$emit('showLoader');
                            ContentService.updatePhase.save({
                                elementId: $scope.data.elementId,
                                phaseCode: phase.code
                            }, {}, function (response) {
                                $scope.$emit('hideLoader');
                                if (!isPhaseChangeError(response)) {
                                    $state.go($state.current, $scope.data.stateData, {reload: true});
                                }
                            }, function (err) {
                                $scope.$emit('hideLoader');
                                console.log(err);
                            });
                        }
                        setSelectedPhase();
                    });
            };

            function isPhaseChangeError(result) {
                if (result.errors instanceof Array && result.errors.length > 0) {
                    var message = 'Phase change failed. Errors detected in following Scenarios.';
                    var errors = [];
                    result.errors.forEach(function (scenario) {
                        errors.push({message: scenario.friendlyId});
                    });
                    $scope.phaseChange.popupData = {
                        type: 'error',
                        title: 'Oops!',
                        body: {
                            message: message,
                            list: errors
                        }
                    };
                    $scope.phaseChange.showModal = true;
                    return true;
                }
                return false;
            }

            $scope.onTaskStatusChange = function () {

                ContentService.status.update({
                    taskId: $scope.data.task._id,
                    isActive: !$scope.data.task.data.isActive
                }, function (obj) {
                    $scope.data.task.data.isActive = obj.status;     //toggle state of task status

                    notificationService.showNotification(
                        {
                            heading: $filter('translate')('common.label.label_confirmation'),
                            message: $filter('translate')('common.label.label_task_status') + ($scope.data.task.data.isActive ? '"' + $filter('translate')('common.label.label_active') + '"' : '"' + $filter('translate')('common.label.label_inactive') + '"')
                        }
                    );
                });
            };

        }]];
});
