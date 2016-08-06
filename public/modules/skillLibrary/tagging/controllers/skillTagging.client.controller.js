'use strict';

define ([
    ], function() {

        return ['SkillTaggingController', ['$scope','$stateParams','$state','TaskScenario','$sce','skillLibraryService',
            '$filter', 'DataTransformer','$element', 'TextSearch','Constants','libraryService','notificationService',
            function ($scope,$stateParams,$state,taskScenario,sce,skillLibraryService, $filter, dataTransformer,
                      $element, textSearch,Constants,libraryService,notificationService) {

                var scenario,updateSkillsForStep;
                $scope.selectedSkills = [];
                $scope.skills =null;
                $scope.sce = sce;
                $scope.commonData = {};
                $scope.constants = Constants;
                var stateToGoParams = {};

                $scope.gridConfig =
                {
                    title : $filter('translate')('skillTagging.label_search_title'),
                    multiSelect: true,
                    rowHeight: 40,
                    fixedHeight : 2*($element.find('.tagged-skill-container').outerHeight())+
                        $element.find('.tagged-skill-container').offset().top + $element.find('.grid-heading').outerHeight() ,
                    data :{
                        sourceData : $scope.skills,
                        selectedData : $scope.selectedSkills,
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
                            width: '50%',
                            cellClass : 'tagging-column',
                            showCount: true,
                            searchConfig: {
                                type: 'textSearch',
                                placeholderText : $filter('translate')('skillTagging.label_placeholder_text')
                            }
                        },
                        {
                            field: ' ',
                            displayName: 'Tag Skills',
                            width: '10%',
                            enableSorting :false,
                            cellTemplate: [
                                {
                                    type: 'button',
                                    staticDisplayName: 'TAG'
                                }
                            ]
                        }
                    ]
                };

                if(Constants.STEP.TASK === $state.current.data.type){
                    stateToGoParams={
                        friendlyId:$stateParams.friendlyId
                    };
                    taskScenario.scenarioByFriendlyIdWithoutActionsWithTaskData.get({friendlyId:$stateParams.friendlyId},
                        function (data) {
                            scenario = data;
                            stateToGoParams.taskId = scenario.taskId._id;
                            $scope.stepJson = scenario.steps[$stateParams.stepNum - 1];
                            $scope.selectedSkills = $scope.stepJson.skills;
                            $scope.gridConfig.data.selectedData = $scope.selectedSkills;
                            $scope.commonData.app = scenario.taskId.app;
                            $scope.commonData.product = $scope.commonData.app.split(' ')[0];
                            $scope.commonData.type = $state.current.data.type;
                        }
                    );
                    updateSkillsForStep = function(){
                        taskScenario.updateSkillsForStep
                            .update({scenarioId:scenario._id,stepId:$scope.stepJson._id,skills:$scope.selectedSkills},
                            function(){
                                $scope.popupClose();
                            }
                        );
                    };
                }
                else if(Constants.STEP.LIBRARY === $state.current.data.type){

                    stateToGoParams={
                        app:$stateParams.app,
                        id:$stateParams.stepId,
                        config:$stateParams.config
                    };
                    libraryService.libraryStepById.get({libraryStepId:$stateParams.stepId},
                        function(libraryStep){
                            $scope.selectedSkills = libraryStep.skills;
                            $scope.gridConfig.data.selectedData =  $scope.selectedSkills;
                            $scope.stepJson = libraryStep;
                            $scope.commonData.app = $stateParams.app;
                            $scope.commonData.product = $stateParams.app;
                            $scope.commonData.type = $state.current.data.type;
                        }
                    );
                    updateSkillsForStep = function () {
                        if(! $scope.selectedSkills.length){
                            var settings={
                                message :  $filter('translate')('skillTagging.label_notification_msg')
                            };
                            notificationService.showNotification(settings);
                        }
                        else{
                            libraryService.updateSkillsForLibraryStep
                                .update({libraryStepId:$scope.stepJson._id,skills:$scope.selectedSkills},
                                function(){
                                    $scope.popupClose();
                                }
                            );
                        }
                    };
                }

                $scope.launchState = function(data){
                    $scope.commonData.product = data;
                };

                $scope.popupClose = function(){
                    $state.go( $state.current.data.stateToGo,stateToGoParams);
                };

                $scope.clearSkill=function($index){
                    $scope.selectedSkills.splice($index,1);
                };

                $scope.doneTagging=function(){
                    updateSkillsForStep();
                };

                $scope.onGridClick = function(data,isSelected){
                    if(isSelected){
                        $scope.selectedSkills.push({_id:data._id,title:data.title,skillId:data.skillId,app:data.app});
                    }
                    else {
                        var indexOfSkill = $scope.selectedSkills.map(function(e) {
                            return e._id;
                        }).indexOf(data._id);
                        $scope.clearSkill(indexOfSkill);
                    }
                };
            }

        ]];
    }
);


