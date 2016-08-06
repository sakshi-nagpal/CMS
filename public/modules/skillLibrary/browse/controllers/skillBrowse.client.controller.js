'use strict';

define ([
    ], function() {

        return ['SkillBrowseController', ['$scope','$stateParams','$filter','TextSearch','$state','Constants','$element',
            '$timeout','Step','notificationService','skillLibraryService',
            function ($scope,$stateParams,$filter,textSearch,$state,Constants,$element,$timeout,
                      StepService, notificationService, skillLibraryService) {

                var stateConfig={
                    isPopupMode: true,
                    stateToGo : 'skill.browse.1',
                    isScenarioSwitchable : false,
                    stateToGoParams: {},
                    isEditable : false
                };
                var match;

                var createBreadcrumb = function(){
                    match = false;
                    $scope.view.breadcrumbs = [];
                    angular.forEach($scope.stateData,function(value,key){
                        if(!match){
                            $scope.view.breadcrumbs.push(value.data);
                            if(value.state === $state.current.name){
                                $scope.currentStateIndex =  $scope.stateData.indexOf(value);
                                match = true;
                            }
                        }
                    });
                };

                $scope.scenario=null;

                $scope.commonData={
                    taskSteps : [],
                    librarySteps : [],
                    app : $stateParams.app,
                    product : $stateParams.app.split(' ')[0],
                    listAutoResize : false
                };

                $scope.view = {
                    breadcrumbs : [],
                    heading : {},
                    subHeading : {},
                    isExportEnabled : true
                };

                $scope.stepData = {
                    product : $scope.commonData.product
                };

                $scope.stateData=
                    [
                        {
                            state:'skill.browse.1',
                            data:{
                                name:'Home',
                                state:Constants.MODULES.dashboard
                            }
                        },
                        {
                            state:'skill.browse.2',
                            data:{
                                name:'Skill Index',
                                state:'skill.browse.1'
                            },
                            showHeading: false,
                            showSubHeading : false
                        }
                    ];

                $scope.$on('$stateChangeSuccess',function(){
                    createBreadcrumb();
                });


                skillLibraryService.taskStepCountForSkillsByProduct.query({product:$scope.commonData.product},
                    function(taskStepCount){
                        $scope.taskStepCount = taskStepCount;
                    });

                skillLibraryService.libraryStepCountForSkillsByProduct.query({product:$scope.commonData.product}, function(libraryStepCount) {
                    $scope.libraryStepCount = libraryStepCount;
                });

                $scope.launchState = function(data){
                    $state.go('skill.browse.1', {app:data});
                };

                $scope.addLibraryStep = function(data, event){
                    event.stopPropagation();
                    $scope.addStepPopupConfig={
                        'header':$filter('translate')('library.addStepModal.label_addStep_title'),
                        'labels':[
                            {
                                title : 'Skill Name',
                                value : data.title
                            }
                        ],
                        'endPoint':'libraryStep.edit'
                    };
                    $scope.stepData.skills = data;
                    stateConfig.stateToGo = 'skill.browse.1';
                    stateConfig.stateToGoParams = {
                        app:$scope.commonData.app
                    };
                    $scope.stateConfig = stateConfig;
                    $element.find('.add-step-modal').modal('show');
                };

                var setAndLaunchAddStepPopup = function(type,id,name){

                    if(type) $scope.stepData.sourceType = type;
                    if(id) $scope.stepData.sourceStepId = id;
                    if(name) $scope.stepData.sourceName = name;

                    $scope.stepData.skills = $scope.commonData.selectedSkill;
                    stateConfig.stateToGo = 'skill.browse.2';
                    stateConfig.stateToGoParams = {
                        stepCount : ($scope.commonData.taskStepsLength) + ($scope.commonData.libraryStepsLength) + 1,
                        app: $scope.commonData.app,
                        skill: $scope.stepData.skills.skillId
                    };
                    $scope.stateConfig = stateConfig;
                    $element.find('.add-step-modal').modal('show');
                };

                $scope.addLibraryStepFromList = function(event){
                    $scope.addStepPopupConfig={
                        'header':$filter('translate')('library.addStepModal.label_addStep_title'),
                        'labels':[
                            {
                                title : 'Source Step',
                                value : $scope.commonData.selectedSkill.title
                            }
                        ],
                        'endPoint':'libraryStep.edit'
                    };
                    setAndLaunchAddStepPopup();
                };

                $scope.copyLibraryStep = function(type,id,stepText,name){
                    $scope.addStepPopupConfig={
                        'header':$filter('translate')('library.addStepModal.label_copyStep_title'),
                        'labels':[
                            {
                                title : 'Source Step Name',
                                value : name
                            },
                            {
                                title : 'Source Step Text',
                                value : stepText
                            }
                        ],
                        'endPoint':'libraryStep.view'
                    };
                    setAndLaunchAddStepPopup(type,id,name);
                };

                $scope.exportTaskStep = function(type,id,stepText){
                    $scope.addStepPopupConfig={
                        'header':$filter('translate')('library.addStepModal.label_exportStep_title'),
                        'labels':[
                            {
                                title : 'Source Step Text',
                                value : stepText
                            }
                        ],
                        'endPoint':'libraryStep.view'
                    };
                    setAndLaunchAddStepPopup(type,id);
                };

                $scope.gridConfig =
                {
                    title : $filter('translate')('skillTagging.label_search_title'),
                    data :{
                        sourceData :$scope.skills,
                        uniqueId : 'skillId'
                    },
                    rowHeight: 40,
                    columns : [
                        {
                            field: 'parentLabels0',
                            displayName: 'Categories',
                            width: '15%',
                            searchConfig:{
                                type: 'dropdown',
                                dependentCols:[1],
                                options: []
                            }
                        },
                        {
                            field: 'parentLabels1',
                            displayName: 'Sub - Categories',
                            width: '15%',
                            searchConfig:{
                                type: 'dropdown',
                                options: $scope.categories
                            }
                        },
                        {
                            field: 'title',
                            displayName: 'Skills',
                            width: '70%',
                            cellClass : 'browse-column',
                            showCount: true,
                            searchConfig: {
                                type: 'textSearch',
                                placeholderText : $filter('translate')('skillTagging.label_placeholder_text')
                            },
                            cellTemplate: [
                                {
                                    type : 'ng-repeat',
                                    template : '<label class="pill pax text-color text-small mrm" ng-repeat="app in row.entity.app">{{app.split(" ")[1]}}</label>'
                                }
                            ]
                        }
                    ]
                };

                $timeout(function(){
                    //120 for footer height : need another way to find footer height
                    $scope.gridConfig.fixedHeight = $element.find('.browse-view').offset().top + 120;
                },0);

                if($scope.authorization.canAccess('edit_content')){
                    var addButton = {
                        type :'button',
                        staticDisplayName : '+',
                        callback: 'buttonCallback',
                        attr : 'title ="Add Library Step"',
                        className : 'add-step inline-display border-indicator-yellow color-indicator-yellow mrm pull-right'
                    };
                    $scope.gridConfig.columns[2].cellTemplate.splice(1,0,addButton);
                }
                if($scope.authorization.canAccess('view_skill_steps')){
                    var libraryStepCountBtn = {
                        type :'html',
                        template : '<button ng-bind=\'grid.appScope.$parent.libraryStepCount[row.entity.skillId] || 0\'' +
                        'class="task-step inline-display border-indicator-yellow color-indicator-yellow pull-right mhl"></button>'
                    }
                    $scope.gridConfig.columns[2].cellTemplate.splice(2,0,libraryStepCountBtn);

                    var taskStepCountBtn = {
                        type :'html',
                        template : '<div class="step-count-container border-theme inline-display pull-right">' +
                        '<button ng-bind=\'grid.appScope.$parent.taskStepCount[row.entity.skillId] || 0\' ' +
                        'class="inline-display color-indicator-pink border-indicator-pink pull-right mrl lib-step"></button></div>'
                    }
                    $scope.gridConfig.columns[2].cellTemplate.splice(3,0,taskStepCountBtn);
                }

                $scope.onGridClick = function(data){
                    $scope.commonData.selectedSkill = data;
                    if(!$scope.taskStepCount[data.skillId] && !$scope.libraryStepCount[data.skillId]){
                        var settings={
                            message : $filter('translate')('skillImport.label_notification_msg')
                        };
                        notificationService.showNotification(settings);
                    }
                    else {
                        $state.go('skill.browse.2',{app:$scope.commonData.app,skill:data.skillId});
                    }
                };

                $scope.onTaskStepListClick = function(skillId,friendlyId,stepId){
                    stateConfig.stateToGo = 'skill.browse.2';
                    stateConfig.stateToGoParams = {
                        app:$scope.commonData.app,
                        skill : skillId
                    };
                    StepService.getStepNumber.get({friendlyId:friendlyId, stepId:stepId}, function(index){
                        $state.go('taskStep.view',{friendlyId:friendlyId, stepIndex:++index.index, config:stateConfig});
                    });
                };

                $scope.onLibraryStepListClick = function(skillId, stepId){
                    stateConfig.stateToGo = 'skill.browse.2';
                    stateConfig.stateToGoParams = {
                        stepCount : ($scope.commonData.taskStepsLength) + ($scope.commonData.libraryStepsLength),
                        app:$scope.commonData.app,
                        skill : skillId
                    };
                    $state.go('libraryStep.view',{app: $scope.commonData.app, id: stepId, config:stateConfig});
                };

            }
        ]];
    }
);





