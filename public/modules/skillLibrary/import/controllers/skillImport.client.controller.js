'use strict';

define ([
    ], function() {

        return ['SkillImportController', ['$scope','$stateParams','$state','TaskScenario','importTaskService','$timeout',
            '$filter','TextSearch','$element', 'notificationService','skillLibraryService','Constants','libraryService',
            function ($scope,$stateParams,$state,taskScenario,importTaskService,$timeout,$filter,textSearch,$element,
                      notificationService, skillLibraryService,Constants,libraryService) {
                var product;

                $scope.commonData = {
                    friendlyId : $stateParams.friendlyId,
                    stepNum : $stateParams.stepNum,
                    taskId : $stateParams.taskId,
                    app : $stateParams.app,
                    listAutoResize : true
                };

                if($stateParams.app)
                    $scope.commonData.product =  $stateParams.app.split(' ')[0];

                $scope.scenario=null;

                $scope.view = {
                    heading: {},
                    subHeading: {}
                };

                $scope.stateData=
                    [
                        {
                            stateText:'CHOOSE SKILL',
                            state:'skillPopup.import.1'
                        },
                        {
                            stateText:'CHOOSE SOURCE STEP',
                            state:'skillPopup.import.2',
                            showHeading: true,
                            showSubHeading : true
                        },
                        {
                            stateText:'REVIEW METHOD AND CONFIRM',
                            state:'skillPopup.import.3'
                        }
                    ];

                $scope.gridConfig =
                {
                    title : $filter('translate')('skillTagging.label_search_title'),
                    rowHeight: 40,
                    data :{
                        sourceData : $scope.skills,
                        uniqueId : 'skillId'
                    },
                    columns : [
                        {
                            field: 'parentLabels0',
                            displayName: 'Categories',
                            width: '20%',
                            searchConfig:{
                                type: 'dropdown',
                                dependentCols:[1],
                                options: []
                            }
                        },
                        {
                            field: 'parentLabels1',
                            displayName: 'Sub - Categories',
                            width: '20%',
                            searchConfig:{
                                type: 'dropdown',
                                options: $scope.categories
                            }
                        },
                        {
                            field: 'title',
                            displayName: 'Skills',
                            width: '60%',
                            showCount: true,
                            cellClass : 'skill-column',
                            searchConfig: {
                                type: 'textSearch',
                                placeholderText : $filter('translate')('skillTagging.label_placeholder_text')
                            },
                            cellTemplate: [
                                {

                                    type :'html',
                                    template : '<button ng-bind=\'grid.appScope.$parent.libraryStepCount[row.entity.skillId] || 0\' class="task-step inline-display border-indicator-yellow color-indicator-yellow pull-right mrl"></button>'
                                },
                                {
                                    type :'html',
                                    template : '<button ng-bind=\'grid.appScope.$parent.taskStepCount[row.entity.skillId] || 0\' class="inline-display color-indicator-pink border-indicator-pink pull-right mrl lib-step"></button>'
                                }
                            ]
                        }
                    ]
                };

                 $timeout(function(){
                     $scope.gridConfig.fixedHeight = $element.find('.state-chooser-container').offset().top +
                                                    $element.find('.state-chooser-container').outerHeight() +
                                                    $element.find('.header').outerHeight()+ 40;
                 },0);

                var getTaskCount = function(){
                    skillLibraryService.taskStepCountForSkillsByProduct.query({product:$scope.commonData.product},
                        function(taskStepCount){
                            $scope.taskStepCount = taskStepCount;
                        });
                };

                var getLibraryStepCount = function(){
                    skillLibraryService.libraryStepCountForSkillsByProduct.query({product:$scope.commonData.product},
                        function(libraryStepCount){
                            $scope.libraryStepCount = libraryStepCount;
                        });
                };

                if(!$scope.commonData.app){
                    taskScenario.scenarioByFriendlyIdWithoutActionsWithTaskData.get({friendlyId: $scope.commonData.friendlyId},
                        function (data) {
                            $scope.scenario = data;
                            $scope.commonData.app=$scope.scenario.taskId.app;
                            $scope.commonData.product=$scope.scenario.taskId.app.split(' ')[0];
                            $scope.commonData.taskId =$scope.scenario._id;
                            getTaskCount();
                            getLibraryStepCount();
                            $scope.$broadcast('scenarioReceived');
                        });
                } else {
                    getTaskCount();
                    getLibraryStepCount();
                }

                $scope.changeState= function(data){
                    $state.go($scope.stateData[data].state,$scope.stateData[data].stateParams);
                };


                $scope.popupClose = function(){
                    $state.go('content.task.scenario',{friendlyId:$scope.commonData.friendlyId});
                };

                $scope.finishImport = function(friendlyId,sourceFriendlyId,stepId,type){
                    if(type === Constants.STEP.TASK){
                        importTaskService.importStep.update({friendlyId: friendlyId, sourceFriendlyId: sourceFriendlyId, stepId: stepId}, function () {
                            $state.go('content.task.scenario.step.view', {friendlyId: $scope.commonData.friendlyId,stepIndex:$scope.commonData.stepNum});
                        });
                    }
                    else {
                        importTaskService.importLibraryStep.update({friendlyId: friendlyId,stepId: stepId}, function (data) {
                            $state.go('content.task.scenario.step.view', {friendlyId: $scope.commonData.friendlyId,stepIndex:$scope.commonData.stepNum});
                            libraryService.addMappedStepDetails.update({libraryStepId: stepId},{taskId: $scope.commonData.taskId, newStepId: data._id},function(){
                            });
                        });

                    }
                };

                $scope.launchState = function(data){
                    $scope.commonData.product = data;
                    getTaskCount();
                    getLibraryStepCount();
                };


                $scope.onGridClick = function(data){
                    $scope.commonData.selectedSkill = data;
                    if(!$scope.taskStepCount[data.skillId] && !$scope.libraryStepCount [data.skillId]){
                        var settings={
                            message :  $filter('translate')('skillImport.label_notification_msg')
                        };
                        notificationService.showNotification(settings);
                    }
                    else {
                        $state.go('skillPopup.import.2',{skill:data.skillId});
                    }
                };

                $scope.onTaskStepListClick = function(skillId,friendlyId,stepId,type){
                    $state.go('skillPopup.import.3',{skill:skillId,taskId:friendlyId,stepId:stepId,type:type});
                };

                $scope.onLibraryStepListClick = function(skillId,stepId,type){
                    $state.go('skillPopup.import.3',{skill:skillId,type:type,stepId:stepId});
                };

                $scope.$on('$stateChangeSuccess', function() {
                        $scope.state = $state.current.name;
                        $scope.currentStateIndex = $state.current.stateNum - 1;
                        if($state.current.stateNum !== 1 && !$state.params.skill){
                            $state.go('skillPopup.import.1');
                        }
                });
            }
        ]];
    }
);







