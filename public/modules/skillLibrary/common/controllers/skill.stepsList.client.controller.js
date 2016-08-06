'use strict';

define ([
], function() {

    return ['SkillStepsListController', ['$scope','$stateParams','$state','TaskScenario','$sce','skillLibraryService', 'libraryService',
        '$timeout','$element','$filter','Constants',
        function ($scope,$stateParams,$state,taskScenario,sce,skillLibraryService,libraryService,$timeout,$element,
                  $filter,Constants) {
            var selectedSkillId= $stateParams.skill;
            var stateNum=$state.current.stateNum;
            var checkStepCount = function(){
                if($scope.taskSteps && $scope.librarySteps){
                    var stepCount = $scope.taskSteps.length + $scope.librarySteps.length;
                    if(! stepCount){
                        $state.go('skill.browse.1',{app : $stateParams.app});
                    }
                }
            };

            var createLabel = function(skill){
                $scope.commonData.selectedSkill.product = $scope.commonData.selectedSkill.app[0].split(' ')[0];
                $scope.view.heading.text = $filter('translate')('skillImport.label_skills_for') +' '+  $scope.commonData.selectedSkill.product ;
                $scope.commonData.selectedSkill.label = skill.parentLabels.join(' - ') + ' - ' + skill.title;
                $scope.view.subHeading.text =  $scope.commonData.selectedSkill.label;

                $timeout(function(){
                    $scope.fixedHeight = $element.find('.steps-container').offset().top  ;
                },0);
            };

            $scope.commonData.skill=$stateParams.skill;
            $scope.constant = Constants;
            $scope.sce=sce;
            $scope.stateData[1].stateParams = {};
            $scope.stateData[1].stateParams.skill=$stateParams.skill;

            if(selectedSkillId){

                skillLibraryService.taskStepsBySkillId.query({skillId: $.trim(selectedSkillId)},function(taskSteps){
                    $scope.taskSteps = taskSteps;
                    $scope.commonData.taskStepsLength = $scope.taskSteps.length;
                    checkStepCount();
                    $scope.$emit('hideLoader');
                },function(err){
                    $state.go('skillPopup.import.1');
                });

                libraryService.libraryStepsBySkillId.query({skillId: $.trim(selectedSkillId)}, function(librarySteps) {
                    $scope.librarySteps = librarySteps;
                    $scope.commonData.libraryStepsLength =  $scope.librarySteps.length;
                    $timeout(function(){
                        $scope.fixedHeight = $element.find('.steps-container').offset().top  ;
                    },0);
                    checkStepCount();
                    $scope.$emit('hideLoader');
                },function(err){
                    $state.go('skillPopup.import.1');
                });

                if($scope.commonData.selectedSkill){
                    var skill = $scope.commonData.selectedSkill;
                    createLabel(skill);
                }
                else{
                    skillLibraryService.skillBySkillId.query({skillId:$.trim(selectedSkillId)}, function (skill) {
                        $scope.commonData.selectedSkill = skill;
                        createLabel(skill);
                    });
                }

            }
            else {
                    $state.go('skillPopup.import.1');
                }

            $scope.onTaskStepClick = function(friendlyId,stepId){
                $scope.onTaskStepListClick($scope.commonData.selectedSkill.skillId,friendlyId,stepId,Constants.STEP.TASK);
            };

            $scope.onLibraryStepClick = function(stepId) {
                $scope.onLibraryStepListClick($scope.commonData.selectedSkill.skillId,stepId,Constants.STEP.LIBRARY);
            };

            $scope.$on('$stateChangeSuccess', function(e, toState) {
                if(($scope.taskSteps || $scope.librarySteps ) && stateNum===toState.stateNum){
                    $scope.$emit('hideLoader');
                }

            });

        }
    ]];
    }
);
