'use strict';

define([], function () {
    return ['historyVersionController', ['$scope', 'ComparisonService', '$stateParams', '$element', '$state', '$sce', 'Constants', function ($scope, ComparisonService, $stateParams, $element, $state, $sce, Constants) {

        // Get entity revision
        ComparisonService.getEntityRevisions.query({
            entityId: $stateParams.id,
            historyIds: [$stateParams.historyId]
        }, function (data) {
            updateMethodTypeCount(data[0].revision, $scope.historyConfig.type);
            $scope.diff = data[0].revision;
            $element.find('.compare-view-box').removeClass('hidden');
            $scope.$emit('hideLoader');
        });

        $(window).on('resize', $scope.getContainerHeight);

        $scope.historyId = $stateParams.historyId;
        $scope.sce = $sce;
        $scope.versionView = true;
        $scope.viewMatchedSection = {
            'all' : true
        };

        var updateMethodTypeCount = function (revisionJson, jsonType) {
            var steps = (jsonType === Constants.STEP.LIBRARY ? [revisionJson] : revisionJson.steps || []);
            var i, j, methods, methodTypeHashMap;

            steps.forEach(function (step, index) {
                var methods = step.methods || [],
                    methodTypeHashMap = {};
                methods.forEach(function (method, index) {
                    if (!methodTypeHashMap[method.type]) {
                        methodTypeHashMap[method.type] = 1;
                    } else {
                        ++methodTypeHashMap[method.type];
                    }
                    if (methodTypeHashMap[method.type] > 1) {
                        method.typeCount = '(' + methodTypeHashMap[method.type] + ')';
                    }
                });
            });

            return revisionJson;
        };

        $scope.onComparisonViewClose = function(){
            if($scope.historyConfig.type === Constants.STEP.LIBRARY) {
                $state.go('libraryStep.view.history');
            } else {
                $state.go('content.task.scenario.history');
            }
            $scope.$emit('hideLoader');
        };

        $scope.getContainerHeight = function () {
            var height = $(window).height() - $element.find('.history-comparion-header').outerHeight();
            $element.find('.compare-view-box').outerHeight(height);
        };

    }]];
});
