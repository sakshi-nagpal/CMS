'use strict';

define([], function () {

    return ['contentHierarchySeriesController', ['$scope', '$state', '$stateParams', 'Hierarchy', 'ContentService', 'Constants', '$translate', '$timeout', '$element',
        function ($scope, $state, $stateParams, Hierarchy, ContentService, Constants, $translate, $timeout, $element) {


            $scope.data.breadcrumbs = [{name: 'Home', state: Constants.MODULES.dashboard}];
            $scope.data.task = {};
            // Get Hierarchy
            Hierarchy.seriesHierarchy.get({seriesId: $stateParams.seriesId}, function (data) {
                $scope.hierarchy = data;
                $scope.data.setHeaderInfo({title1: '', title2: data.title, appIcon: data.data.icon});
                $scope.data.setHeaderTabs('series');
                $scope.data.setContentType(data.type);
                $scope.data.setElementId(data._id);
                $scope.view = 'view1';
                var taxonomy = data.data.taxonomy;
                $scope.$emit('hideLoader');
                $scope.projectCountLabel = $scope.data.getTaxonomyByProperty(taxonomy, 'type', 'cms_project')[0].name + ' Count';
                $scope.taskCountLabel = $scope.data.getTaxonomyByProperty(taxonomy, 'type', 'cms_task')[0].name + ' Count';
                $scope.data.indicators = [$scope.projectCountLabel, $scope.taskCountLabel];  // set indicators
            }, function (error) {
                $scope.$emit('hideLoader');
            });
            ContentService.childCountByType.query({
                seriesId: $stateParams.seriesId,
                parentType: 'cms_chapter',
                childType: 'cms_task'
            }, function (data) {
                $scope.data.taskCount = data;
            });
            ContentService.childCountByType.query({
                seriesId: $stateParams.seriesId,
                parentType: 'cms_chapter',
                childType: 'cms_project'
            }, function (data) {
                $scope.data.projectCount = data;
            });

            $scope.data.breadcrumbs = [{name: 'Home', state: Constants.MODULES.dashboard}];

            // Hierarchy leaf node click handler
            $scope.onChildElementClick = function (elementId) {
                $state.go('content.hierarchy2.0', {seriesId: $stateParams.seriesId, elementId: elementId});
            };
            $scope.data.scenarioTabs = {};

            //fist element to be focussed on Keydown
            $timeout(function () {
                var focusedElement = $element.find('.vertical-navigation:first');
                $scope.$emit('focusFirstEle', focusedElement);
            }, 500);
        }]];
});

