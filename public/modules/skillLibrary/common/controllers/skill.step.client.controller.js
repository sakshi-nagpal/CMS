'use strict';

define ([
], function() {

    return ['SkillStepController', ['$scope','$stateParams','$state','TaskScenario','$sce','skillLibraryService',
        '$element','$timeout','libraryService','Constants',
        function ($scope,$stateParams,$state,taskScenario,sce,skillLibraryService,$element,$timeout,libraryService,Constants) {
            var selectedSkillId = $stateParams.skill;
            var stateNum=$state.current.stateNum;
            $scope.constant = Constants;
            $scope.commonData.sourceTaskId = $stateParams.taskId;
            $scope.commonData.type = $stateParams.type;
            $scope.commonData.stepId = $stateParams.stepId;
            $scope.sce=sce;
            var createLabel = function(skill){
                $scope.commonData.selectedSkill.label = skill.parentLabels.join(' > ') + ' > ' + skill.title;
                $scope.stateData[2].data = {};
                $scope.stateData[2].data.name =$scope.commonData.app+' : '+ skill.title;
                $scope.stateData[2].data.state = 'skill.browse.1';
            };
                $scope.stateData[1].stateParams = {};
                $scope.stateData[1].stateParams.skill= $.trim(selectedSkillId);      //to get breadcrumb data

            if($scope.commonData.selectedSkill){
                var skill = $scope.commonData.selectedSkill;
                createLabel(skill);
                $scope.commonData.selectedSkill.product = $scope.commonData.selectedSkill.app[0].split(' ')[0];
            }
            else{
                skillLibraryService.skillBySkillId.query({skillId:$.trim(selectedSkillId)}, function (skill) {
                    $scope.commonData.selectedSkill = skill;
                    createLabel(skill);
                });
            }
            if($scope.commonData.type === Constants.STEP.TASK){
                $scope.constant.STEP.TASK = Constants.STEP.TASK;
                taskScenario.methodsByStepId.get({friendlyId: $stateParams.taskId,stepId:$stateParams.stepId}, function (response) {
                    $scope.scenario = response.scenario;
                    $scope.step = response.step;
                    $timeout(function(){
                        $scope.fixedHeight = $element.find('.method-container').offset().top + 80;
                    },0);
                    $scope.$emit('hideLoader');
                });
            }
            else{
                $scope.constant.STEP.LIBRARY = Constants.STEP.LIBRARY;
                libraryService.libraryStepById.get({libraryStepId: $stateParams.stepId}, function (stepJson) {
                    $scope.step = stepJson;
                    $timeout(function(){
                        $scope.fixedHeight = $element.find('.method-container').offset().top + 80;
                    },0);
                    $scope.$emit('hideLoader');
                });
            }
            $scope.$on('$stateChangeSuccess', function(e, toState) {
                if($scope.step && stateNum===toState.stateNum){
                    $scope.$emit('hideLoader');
                }

            });
        }
    ]];
    }
);
