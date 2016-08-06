'use strict';

define([], function () {

    return ['contentHierarchyElementController', ['$scope', '$state', '$stateParams', '$filter', 'Hierarchy', 'ContentService', 'Constants', '$timeout', '$element', '$modal', 'ConfirmPopupService', 'contentConstants',
        function ($scope, $state, $stateParams, $filter, Hierarchy, ContentService, Constants, $timeout, $element, $modal, ConfirmPopupService, contentConstants) {

            $scope.data.breadcrumbs = [{name: 'Home', state: Constants.MODULES.dashboard}];
            $scope.data.task = {};
            // Get hierarchy
            Hierarchy.elementHierarchy.get({
                seriesId: $stateParams.seriesId,
                elementId: $stateParams.elementId
            }, function (data) {
                $scope.hierarchy = data;
                $scope.data.setHeaderInfo({title2: data.title, appIcon: data.app});
                $scope.data.setContentType(data.type);
                $scope.data.setElementId(data._id);
                $scope.$emit('hideLoader');
            });

            // Get ancestors
            Hierarchy.elementAncestors.query({elementId: $stateParams.elementId}, function (data) {
                $scope.ancestors = data;
                $scope.data.seriesId = $stateParams.seriesId;
                $scope.view = 'view2';
                var taxonomy = $scope.ancestors[0].data.taxonomy;
                $scope.data.scenarioTypes = $filter('orderBy')($scope.ancestors[0].data.scenarioTypes, 'index');
                $scope.data.indicators = [];
                angular.forEach($scope.data.scenarioTypes, function (scenarioType) {
                    $scope.data.indicators.push(scenarioType.code);
                });
                $scope.metadataEntity = $scope.data.getTaxonomyByProperty(taxonomy, 'type', 'cms_project')[0].name;
                $scope.data.breadcrumbs.push({
                    name: $scope.ancestors[0].title,
                    state: 'content.hierarchy1.0({ seriesId:"' + $scope.data.seriesId + '"})'
                });
                $scope.data.setHeaderInfo({title1: data[1].title});
            });

            ContentService.taskPhases.query({
                seriesId: $stateParams.seriesId,
                elementId: $stateParams.elementId
            }, function (data) {
                $scope.phases = data;
            });

            $scope.data.stateData = {
                seriesId: $stateParams.seriesId,
                elementId: $stateParams.elementId
            };

            // set header tabs
            $scope.data.setHeaderTabs('element');

            // Leaf node click Handler
            $scope.onChildElementClick = function (elementId, elementFriendlyId) {
                $state.go('content.task.scenario', {
                    taskId: elementId,
                    friendlyId: elementFriendlyId + '.' + $scope.data.scenarioTypes[0].code
                });
            };
            $scope.data.scenarioTabs = {};

            //fist element to be focussed on Keydown
            $timeout(function () {
                var focusedElement = $element.find('.vertical-navigation:first');
                $scope.$emit('focusFirstEle', focusedElement);
            }, 500);

            $scope.showPopup = function (project) {
                var modalInstance = $modal.open({
                    animation: true,
                    templateUrl: "/modules/document/views/project.file.client.view.html",
                    controller: "ProjectDocumentController",
                    size: 'md',
                    resolve: {
                        project: function () {
                            return project;
                        },
                        scenarioTypes: function () {
                            return $scope.data.scenarioTypes;
                        }
                    }
                });
                modalInstance.result.then(function (result) {
                    callback(result);
                }, function () {
                });
            };

        }]];
});
