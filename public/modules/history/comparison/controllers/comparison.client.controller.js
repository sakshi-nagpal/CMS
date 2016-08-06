'use strict';

define([], function() {
    return ['comparisonController', ['$scope','ComparisonService','$element','$stateParams','$state', 'Compare','comparisonConstants', 'Constants', '$sce', function($scope,ComparisonService,$element,$stateParams,$state,Compare,comparisonConstants, Constants, sce) {

        $scope.sce =sce;
        var historyCompareConfig = {
            dataSet : {
                leftData : {},
                rightData : {}
            },
            comparator : null
        };

        $scope.leftId= $stateParams.leftId;
        $scope.rightId = $stateParams.rightId;
        $scope.viewMatchedSection = {
            'all' : false,
            'initCount': 0,
            'clickCount': 0
        };
        //diff.view ? showFull = 'Show Matching Sections' : showFull = 'Hide Matching Sections';diff.view  = !diff.view;

        var VALUE_TYPE_STRING = comparisonConstants.COMP_ENGINE_CONST.IN_BUILT_DATA_TYPES[0],
            VALUE_TYPE_ARRAY = comparisonConstants.COMP_ENGINE_CONST.IN_BUILT_DATA_TYPES[1],
            VALUE_TYPE_OBJECT = comparisonConstants.COMP_ENGINE_CONST.IN_BUILT_DATA_TYPES[2],
            VALUE_COMPARATOR = comparisonConstants.COMP_ENGINE_CONST.COMP_ENGINE[0],
            TEXT_COMPARATOR = comparisonConstants.COMP_ENGINE_CONST.COMP_ENGINE[1],
            PRIMARY_ATTR_AS_INDEX = comparisonConstants.COMP_ENGINE_CONST.PRIMARY_ATTR_ARRAY[0],
            PRIMARY_ATTR_AS_ID = comparisonConstants.COMP_ENGINE_CONST.PRIMARY_ATTR_ARRAY[1],
            PRIMARY_ATTR_AS_PROPERTY_VALUE = comparisonConstants.COMP_ENGINE_CONST.PRIMARY_ATTR_ARRAY[2];

        var libraryStepCompConfig = {
            v2: {
                'root': {
                    'nodeType': 'libraryStep',
                    'primaryAttr': PRIMARY_ATTR_AS_INDEX,
                    'attr': [
                        {'key': 'name', 'type': VALUE_TYPE_STRING, 'ref': null, 'compEngine': TEXT_COMPARATOR, 'diffPropagation': true},
                        {'key': 'text', 'type': VALUE_TYPE_STRING, 'ref': null, 'compEngine': TEXT_COMPARATOR, 'diffPropagation': true, 'htmlDiff': true},
                        {'key': 'methods', 'type': VALUE_TYPE_ARRAY,  'ref': 'methods', 'compEngine': VALUE_COMPARATOR }
                    ]
                },
                'methods': {
                    'nodeType': 'method',
                    'primaryAttr': PRIMARY_ATTR_AS_ID,
                    'attr': [
                        {'key': 'type', 'type': VALUE_TYPE_STRING, 'ref': null, 'compEngine': VALUE_COMPARATOR, 'diffPropagation': true},
                        {'key': 'actions', 'type': VALUE_TYPE_ARRAY, 'ref': 'actions', 'compEngine': VALUE_COMPARATOR},
                        {'key': 'order', 'type': VALUE_TYPE_STRING, 'ref': null, 'compEngine': TEXT_COMPARATOR, 'generated': true},
                        {'key': 'primary', 'type': VALUE_TYPE_STRING, 'ref': null, 'compEngine': VALUE_COMPARATOR},
                        {'key':'typeCount', 'type': VALUE_TYPE_STRING, 'ref': null, 'compEngine': VALUE_COMPARATOR, 'diffPropagation': true}
                    ]
                },
                'actions': {
                    'nodeType': 'action',
                    'primaryAttr': PRIMARY_ATTR_AS_ID,
                    'attr': [
                        {'key': 'text', 'type': VALUE_TYPE_STRING, 'ref': null, 'compEngine': TEXT_COMPARATOR, 'diffPropagation': true, 'htmlDiff': true},
                        {'key': 'order', 'type': VALUE_TYPE_STRING, 'ref': null, 'compEngine': TEXT_COMPARATOR, 'generated': true}
                    ]
                }
            }
        };

        var itemCompConfig = {
            v2: {
                'root': {
                    'nodeType': 'scenario',
                    'primaryAttr': PRIMARY_ATTR_AS_INDEX,
                    'attr': [
                        {'key': 'friendlyId', 'type': VALUE_TYPE_STRING, 'ref': null, 'compEngine': TEXT_COMPARATOR, 'diffPropagation': true},
                        {'key': 'title', 'type': VALUE_TYPE_STRING,  'ref': null,   'compEngine': TEXT_COMPARATOR, 'diffPropagation': true },
                        {'key': 'eTextURL', 'type': VALUE_TYPE_STRING, 'ref': null, 'compEngine': TEXT_COMPARATOR, 'diffPropagation': true},
                        {'key': 'videoURL', 'type': VALUE_TYPE_STRING, 'ref': null, 'compEngine': TEXT_COMPARATOR, 'diffPropagation': true},
                        {'key': 'difficulty', 'type': VALUE_TYPE_STRING, 'ref': null, 'compEngine': VALUE_COMPARATOR},
                        {'key': 'levelOfRevision', 'type': VALUE_TYPE_STRING, 'ref': null, 'compEngine': VALUE_COMPARATOR},
                        {'key': 'pageNo', 'type': VALUE_TYPE_STRING, 'ref': null, 'compEngine': TEXT_COMPARATOR},
                        {'key': 'steps', 'type': VALUE_TYPE_ARRAY, 'ref': 'steps', 'compEngine': VALUE_COMPARATOR},
                        {'key': 'documents', 'type': VALUE_TYPE_ARRAY, 'ref': 'documents', 'compEngine': VALUE_COMPARATOR},
                        {'key': 'phase','type': VALUE_TYPE_OBJECT, 'ref': 'phase', 'compEngine': TEXT_COMPARATOR}
                    ]
                },
                'documents': {
                    'nodeType': 'document',
                    'primaryAttr': PRIMARY_ATTR_AS_PROPERTY_VALUE,
                    'primaryAttrValue': 'category._id',
                    'attr': [
                        {'key': 'category', 'type': VALUE_TYPE_OBJECT, 'ref': 'category', 'compEngine': TEXT_COMPARATOR},
                        {'key': 'file', 'type': VALUE_TYPE_ARRAY, 'ref': 'file', 'compEngine': VALUE_COMPARATOR}
                    ]
                },
                'category':{
                    'nodeType': 'category',
                    'primaryAttr': PRIMARY_ATTR_AS_ID,
                    'attr': [
                        {'key': '_id', 'type': VALUE_TYPE_STRING, 'ref': null, 'compEngine': TEXT_COMPARATOR, 'diffPropagation': true},
                        {'key': 'displayName', 'type': VALUE_TYPE_STRING, 'ref': null, 'compEngine': TEXT_COMPARATOR, 'diffPropagation': true},
                        {'key': 'allowedAmount', 'type': VALUE_TYPE_STRING, 'ref': null, 'compEngine': TEXT_COMPARATOR, 'diffPropagation': true}
                    ]
                },
                'file':{
                    'nodeType': 'file',
                    'primaryAttr': PRIMARY_ATTR_AS_ID,
                    'attr': [
                        {'key': 'originalName', 'type': VALUE_TYPE_STRING, 'ref': null, 'compEngine': TEXT_COMPARATOR, 'diffPropagation': true},
                        {'key': '_id', 'type': VALUE_TYPE_STRING, 'ref': null, 'compEngine': TEXT_COMPARATOR, 'diffPropagation': true}
                    ]
                },
                'steps': {
                    'nodeType': 'step',
                    'primaryAttr': PRIMARY_ATTR_AS_ID,
                    'attr': [
                        {'key': 'text', 'type': VALUE_TYPE_STRING, 'ref': null, 'compEngine': TEXT_COMPARATOR, 'htmlDiff': true},
                        {'key': 'methods', 'type': VALUE_TYPE_ARRAY, 'ref': 'methods', 'compEngine': VALUE_COMPARATOR},
                        {'key': 'order', 'type': VALUE_TYPE_STRING, 'ref': null, 'compEngine': TEXT_COMPARATOR, 'generated': true}
                    ]
                },
                'methods': {
                    'nodeType': 'method',
                    'primaryAttr': PRIMARY_ATTR_AS_ID,
                    'attr': [
                        {'key': 'type', 'type': VALUE_TYPE_STRING, 'ref': null, 'compEngine': VALUE_COMPARATOR, 'diffPropagation': true},
                        {'key': 'actions', 'type': VALUE_TYPE_ARRAY, 'ref': 'actions', 'compEngine': VALUE_COMPARATOR},
                        {'key': 'order', 'type': VALUE_TYPE_STRING, 'ref': null, 'compEngine': TEXT_COMPARATOR, 'generated': true,'diffPropagation': true},
                        {'key': 'primary', 'type': VALUE_TYPE_STRING, 'ref': null, 'compEngine': VALUE_COMPARATOR, 'diffPropagation': true},
                        {'key':'typeCount', 'type': VALUE_TYPE_STRING, 'ref': null, 'compEngine': VALUE_COMPARATOR, 'diffPropagation': true}
                    ]
                },
                'actions': {
                    'nodeType': 'action',
                    'primaryAttr': PRIMARY_ATTR_AS_ID,
                    'attr': [
                        {'key': 'text', 'type': VALUE_TYPE_STRING, 'ref': null, 'compEngine': TEXT_COMPARATOR, 'diffPropagation': true, 'htmlDiff': true},
                        {'key': 'order', 'type': VALUE_TYPE_STRING, 'ref': null, 'compEngine': TEXT_COMPARATOR, 'generated': true,'diffPropagation': true}
                    ]
                },
                'phase': {
                    'nodeType': 'phase',
                    'primaryAttr': PRIMARY_ATTR_AS_INDEX,
                    'attr': [
                        {'key': 'name', 'type': VALUE_TYPE_STRING, 'ref': null, 'compEngine': TEXT_COMPARATOR}
                    ]
                }
            }
        };

        //
        itemCompConfig.v1  = {};
        angular.copy(itemCompConfig.v2, itemCompConfig.v1);
        itemCompConfig.v1.actions = {
            'nodeType': 'action',
                'primaryAttr': PRIMARY_ATTR_AS_INDEX,
                'attr': [
                {'key': 'text', 'type': VALUE_TYPE_STRING, 'ref': null, 'compEngine': TEXT_COMPARATOR, 'diffPropagation': true, 'htmlDiff': true}
            ]
        };

        var updateMethodTypeCount = function(revisionJson, jsonType){
            var steps = (jsonType === Constants.STEP.LIBRARY ? [revisionJson] : revisionJson.steps || []);
            var i, j, methods, methodTypeHashMap;

            steps.forEach(function(step,index){
                var methods = step.methods || [],
                    methodTypeHashMap = {};
                methods.forEach(function(method,index){
                    if(!methodTypeHashMap[method.type]){
                        methodTypeHashMap[method.type] = 1;
                    }else{
                        ++methodTypeHashMap[method.type];
                    }
                    if(methodTypeHashMap[method.type]>1){
                        method.typeCount = '('+methodTypeHashMap[method.type]+')';
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

        $(window).on('resize',$scope.getContainerHeight);

        $scope.getContainerHeight = function(){
            var height = $(window).height() - $element.find('.history-comparion-header').outerHeight();
            $element.find('.compare-view-box').outerHeight(height);
        };

        $scope.$watch('viewMatchedSection.clickCount', function(newVal, oldVal) {
            if($scope.viewMatchedSection.initCount && $scope.viewMatchedSection.clickCount === $scope.viewMatchedSection.initCount) {
                $scope.viewMatchedSection['all'] = !$scope.viewMatchedSection['all'];
            }
        });

        $scope.isMethodChanged = function() {
            var methodChanged = false;
            for(var i = 0; i < $scope.diff.methods.length; i++) {
                if($scope.diff.methods[i].order.diffDistance || $scope.diff.methods[i].primary.diffDistance) {
                    methodChanged = true;
                    break;
                } else {
                    for(var j = 0; j < $scope.diff.methods[i].actions.length; j++) {
                        if($scope.diff.methods[i].actions[j].order.diffDistance) {
                            methodChanged = true;
                            break;
                        }
                    }
                    break;
                }
            }
            return methodChanged;
        };

        $scope.toggleMatchedSectionsDisplay = function () {

            for (var i in $scope.viewMatchedSection) {
              if (i === 'all') {
                  $scope.viewMatchedSection[i] = !$scope.viewMatchedSection[i];
              }
             else {
                $scope.viewMatchedSection[i] = false;
             }
             }
            $scope.viewMatchedSection.clickCount = 0;
        };
        // Get entity revisions
        ComparisonService.getEntityRevisions.query({entityId:$stateParams.id,historyIds :[$stateParams.leftId,$stateParams.rightId]}, function (data) {
            var entityType = ($scope.historyConfig.type === Constants.STEP.LIBRARY ? libraryStepCompConfig : itemCompConfig);

            var configVer = Math.min(data[0].typeVersion,data[1].typeVersion);
            historyCompareConfig.dataSet.leftData =  updateMethodTypeCount(data[0].revision, $scope.historyConfig.type);
            historyCompareConfig.dataSet.rightData = updateMethodTypeCount(data[1].revision, $scope.historyConfig.type);
            historyCompareConfig.comparator = new Compare(entityType['v'+configVer]);
            $scope.diff = historyCompareConfig.comparator.compare(historyCompareConfig.dataSet.leftData, historyCompareConfig.dataSet.rightData);
            $element.find('.compare-view-box').removeClass('hidden');
            $scope.$emit('hideLoader');
        });
    }]];
});

