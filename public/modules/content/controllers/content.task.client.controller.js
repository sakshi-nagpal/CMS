'use strict';

define([], function () {

    return ['contentTaskController', ['$scope', '$filter', '$q', 'Hierarchy', 'ContentService', 'Constants', '$state', function ($scope, $filter, $q, Hierarchy, ContentService, Constants, $state) {
        $scope.paintTaskViewerHeader = function (taskId) {
            if ($scope.task && taskId === $scope.task._id) {
                /*
                 just a Tab change, same task Id, no need to call services
                 */
                onServiceDone();
            }

            else {
                //Get ancestors & set data
                $scope.data.indicators = [];
                var ancestors = Hierarchy.elementAncestors.query({elementId: taskId}, function (ancestors) {
                    $scope.ancestors = ancestors;
                    var taxonomy = $scope.ancestors[0].data.taxonomy;
                    var view0Taxonomy, view1Taxonomy, view2Taxonomy;
                    var view0Titles = [], view1Titles = [], view2Titles = [];

                    angular.forEach(taxonomy, function (value, key) {
                        view0Taxonomy = $scope.data.getTaxonomyByProperty(taxonomy, 'view', '0');
                        view1Taxonomy = $scope.data.getTaxonomyByProperty(taxonomy, 'view', '1');
                        view2Taxonomy = $scope.data.getTaxonomyByProperty(taxonomy, 'view', '2');
                    });

                    $scope.data.scenarioTypes = $filter('orderBy')($scope.ancestors[0].data.scenarioTypes, 'index');
                    $scope.data.scenarioTypeNames = [];
                    angular.forEach($scope.data.scenarioTypes, function (scenarioType) {
                        $scope.data.scenarioTypeNames.push(scenarioType.code);
                    });
                    angular.forEach($scope.ancestors, function (value, key) {
                        if (($scope.data.getTaxonomyByProperty(view0Taxonomy, 'type', value.type)).length) {
                            view0Titles.push(value.title);
                        }
                        else if (($scope.data.getTaxonomyByProperty(view1Taxonomy, 'type', value.type)).length) {
                            view1Titles.push(value.title);
                        }
                        else {
                            view2Titles.push(value.title);
                        }
                    });

                    [].push.apply(view1Titles, view2Titles.slice(0, -1));
                    $scope.data.setHeaderInfo({title1: view2Titles[view2Titles.length - 1]});
                    $scope.data.seriesId = $scope.ancestors[0]._id; // series id
                    $scope.data.elementId = $scope.ancestors[view1Taxonomy.length]._id; // view 1 leaf element id (say, chapter)

                    $scope.data.breadcrumbs = [{name: 'Home', state: Constants.MODULES.dashboard}];
                    $scope.data.breadcrumbs.push({
                        name: view0Titles[view0Titles.length - 1],
                        state: 'content.hierarchy1.0({ seriesId:"' + $scope.data.seriesId + '"})'
                    });
                    $scope.data.breadcrumbs.push({
                        name: view1Titles.join(' - '),
                        state: 'content.hierarchy2.0({ seriesId:"' + $scope.data.seriesId + '", elementId: "' + $scope.data.elementId + '"})'
                    });
                });

                var task = ContentService.taskById.get({taskId: taskId}, function (task) {
                    $scope.task = task;
                    $scope.data.setHeaderInfo({title2: $scope.task.title, appIcon: $scope.task.app});
                    $scope.data.task = task;
                });

                $q.all([ancestors.$promise, task.$promise]).then(onServiceDone);
            }

        };

        function onServiceDone() {
            var taskFriendlyId = $scope.task.data.friendlyId;
            $scope.data.scenarioTabs = [];
            $scope.data.scenarioTypeNames.forEach(function (currentValue) {
                var obj = {};
                obj.name = currentValue;
                obj.stateRef = 'content.task.scenario({"taskId":"' + $scope.task._id + '","friendlyId":"' + taskFriendlyId + '.' + currentValue + '"})';
                if ($state.current.name.indexOf('content.task.scenario') > -1) {
                    $scope.data.scenarioTabs.push(obj); // push only if on current page, promise fulfil might take time!
                }

            });
            $scope.data.setContentType($scope.task.type);
            $scope.data.setElementId($scope.task._id);
        }

        $scope.updateTaskMetadata = function (task) {
            return ContentService.taskById.update({taskId: task._id}, {data: task.data}, function (task) {
                $scope.task = task;
            });
        };
    }]];
});
