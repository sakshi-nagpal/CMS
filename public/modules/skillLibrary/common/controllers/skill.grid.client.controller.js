'use strict';

define ([
    ], function() {

        return ['SkillGridController', ['$scope','$state','skillLibraryService',
            'DataTransformer','$element','$timeout','notificationService','TextSearch',
            function ($scope,$state,skillLibraryService,dataTransformer, $element, $timeout,
                      notificationService, textSearch) {
                var product;
                var stateNum=$state.current.stateNum;
                $scope.skills=null;

                $scope.$watch('commonData.product', function(newValue, oldValue){
                    if(newValue != oldValue) {
                        $scope.$emit('showLoader');
                        $scope.skills = null;
                        getSkill();
                        getSkillCategories();
                    }
                });

                var getSkill = function(){
                    product = $scope.commonData.product;

                    var indexedColumns = ['skillId', 'title', 'parentLabels0', 'parentLabels1', 'index'];
                    var indexedKey = 'skillTagging';

                    skillLibraryService.skillListByProduct.query({product:product},
                        function(skillsData){
                            $scope.gridConfig.data.sourceData=dataTransformer.transformData(skillsData);
                            $scope.gridConfig.title+=product;
                            if($scope.gridConfig.searchConfig){
                                $scope.gridConfig.searchConfig.index = textSearch.loadIndex($scope.gridConfig.data.sourceData,
                                    indexedColumns, indexedKey, product);
                            }
                            if($scope.gridConfig.columns[0].searchConfig)
                                $scope.gridConfig.columns[0].searchConfig.options = $scope.categories;
                            $scope.skills=skillsData;
                            $scope.$emit('hideLoader');
                            onFiltersAvailable(0, $scope.categories);
                    });
                };

                var createCategoryTree = function(data){
                    if(!angular.isArray(data))
                        data = [data];
                    var resultJson = {};
                    var child = {};
                    angular.forEach(data, function(obj){
                        resultJson[obj._id] = {};
                        resultJson[obj._id].children = [];
                        angular.forEach(obj.children, function(subCategory){
                            child = {};
                            child._id = subCategory._id;
                            child.id = subCategory.title;
                            child.label = subCategory.title;
                            child.value = subCategory.title;
                            resultJson[obj._id].children.push(child);
                        });
                    });
                    return resultJson;
                };

                $scope.categories = {};
                var getSkillCategories = function() {
                    skillLibraryService.categoriesByProduct.query({product: $scope.commonData.product}, function (categories) {

                        categories.forEach(function (category) {
                            category.id = category.title;
                            category.value = category.title;
                            category.label = category.title;
                        });
                        $scope.skillIndexTree = createCategoryTree(categories);
                        $scope.categories = categories;
                        // to cover case when skills are fetched from cache
                        if($scope.gridConfig)
                            $scope.gridConfig.columns[0].searchConfig.options = $scope.categories;
                        onFiltersAvailable(0, categories);
                    });
                };

                var onFiltersAvailable = function(columnIndex, options){
                    $scope.$broadcast('columnFilterChange',{columnIndex:columnIndex, options: options});
                };

                if ($scope.commonData.product) { // if launched from scenario viewer with hidden params
                    getSkill();
                    getSkillCategories();
                }
                else{ // if refresh `
                    $scope.$on('scenarioReceived', function () {
                        getSkill();
                        getSkillCategories();
                    });
                }

                $scope.$on('$stateChangeStart', function(e, toState) {
                        notificationService.hideNotification();
                });

                $scope.$on('$stateChangeSuccess', function(e, toState) {
                   if($scope.skills && stateNum===toState.stateNum){
                       $scope.$emit('hideLoader');
                   }
                });

                $scope.onColumnFilter = function(columnIndex, data){
                    if(columnIndex === 0){
                        var subCategories = $scope.skillIndexTree[data._id].children;
                        onFiltersAvailable(1, subCategories);
                    }

                };
            }
        ]];
    }
);



