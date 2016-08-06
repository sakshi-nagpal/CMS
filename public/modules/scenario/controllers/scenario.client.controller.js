'use strict';
define([], function () {

    return ['scenarioController', ['$scope', '$sce', 'TaskScenario', '$state', '$stateParams', '$rootScope', 'Step', '$filter', '$element', '$timeout', '$q', 'CommentPopupService', 'ScenarioCommentPopupService', 'notificationService', function ($scope, sce, scenarioService, state, $stateParams, $rootScope, stepService, $filter, $element, $timeout, $q, CommentPopupService, ScenarioCommentPopupService, notificationService) {
        $scope.stepNewCommnetCount = [];
        $scope.scenarioNewComment = 0;
        var friendlyId = $stateParams.friendlyId;
        var lastSavedMetaData;
        $scope.stepNum = 0;
        $scope.levelOfRevisionRange = {'--Select--': -1, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6};
        $scope.stepConfig = {
            isPopupMode: false,
            stateToGo: 'content.task.scenario',
            isScenarioSwitchable: true,
            stateToGoParams: {},
            isEditable: true
        };
        $scope.historyConfig = {
            headerTitle: 'history.scenario.label_history_header_title',
            comparisonHeaderTitle: 'history.scenario.label_task_history_comparison',
            title: 'scenario.label_task_id',
            versionHeaderTitle: 'history.scenario.label_task_history_version',
            stateToGo: 'content.task.scenario',
            additionalFields: [
                {
                    name: 'Phase'
                }
            ],
            publishable: true,
            errMsg: 'history.scenario.label_history_not_available',
            template: 'scenario.comparison.client.view.html'
        };

        $scope.createBlankScenario = true;
        $scope.manageMethodStatus = true; //if step viewer lanches from scenario viewer, method's status is editable

        var getStepNewCommentCount = function () {
            if ($scope.stepNewCommentCountArray == undefined) {
                var scenarioId = $scope.scenario._id;
                scenarioService.getScenarioNewCommentCount.get({
                    scenarioId: scenarioId
                }, function (response) {
                    $scope.stepNewCommentCountArray = {countArray: response.steps};
                }, function (errorResponse) {
                    $scope.error = errorResponse.data.message;

                });
            }
        };

        var getScenarioNewComment = function () {
            if ($scope.scenarioNewCommentCount == undefined) {
                var scenarioId = $scope.scenario._id;
                scenarioService.getScenarioNewCommentCount.get({
                    scenarioId: scenarioId
                }, function (response) {
                    $scope.scenarioNewComment = response.count;
                    $scope.scenarioNewCommentCount = {count: $scope.scenarioNewComment};
                }, function (errorResponse) {
                    $scope.error = errorResponse.data.message;
                });
            }
        };

        var getScenarioByFriendlyID = function (friendlyId) {
            scenarioService.scenarioByFriendlyIdWithoutActions.get({friendlyId: friendlyId}, function (data) {//Valid Scenario
                $scope.taskId = data.taskId;
                if (!$stateParams.taskId) {
                    $stateParams.taskId = data.taskId;
                    $scope.paintTaskViewerHeader(data.taskId);
                }
                getScenariosByTaskId(data.taskId);
                if (data.friendlyId) { //Scenario Exists
                    $scope.scenario = data;
                    $timeout(function () {
                        getStepNewCommentCount();
                    });
                    $timeout(function () {
                        getScenarioNewComment();
                    });
                    // set history Configuration
                    $scope.historyConfig.value = $scope.scenario.friendlyId;
                    paintPhase();
                    populateScenarioSkills(data);

                    $scope.stepNum = $scope.scenario.steps.length + 1;
                    populateOptionsModel();
                }
                $scope.$emit('hideLoader');
                $timeout(function () {
                    $element.find('.selectpicker').removeAttr('title');
                });
            }, function (err) {
                state.go('dashboard');//Invalid Scenario Case
            });
        };

        var paintPhase = function () {
            $scope.phases = window.phases;
            $timeout(function () {
                var element = $element.find('.phase-dropdown');
                var $options = element.find('option');
                var $selectedIndex;
                var isSelectPicker = element.find('li.selected').index() >= 0;
                if (isSelectPicker) {
                    $selectedIndex = element.find('li.selected').index();
                    $options.eq($selectedIndex + 1).removeAttr('disabled');
                    element.selectpicker('render');
                } else {
                    $selectedIndex = element.find('option[selected]').index();
                }
                $options.each(function () {
                    if ($(this).index() > ($selectedIndex + 1)) {
                        this.setAttribute('disabled', '');
                    }
                });
                element.selectpicker('render');
                $element.find('.simulation').selectpicker();
            });
        };

        var getScenariosByTaskId = function (taskId) {
            scenarioService.scenariosByTaskId.query({taskId: taskId}, function (scenarioSiblings) {
                var data = [];
                scenarioSiblings.forEach(function (scenario) {
                    if (scenario.friendlyId !== $stateParams.friendlyId) {
                        var tmpData = {};
                        tmpData.stateRef = 'import.task.scenario({friendlyId:"' + $stateParams.friendlyId + '",sourceFriendlyId:"' + scenario.friendlyId + '"})';
                        tmpData.thumbnail = 'scenario_viewer';
                        tmpData.caption = $filter('translate')('scenario.copyScenario.label_copy_caption') + scenario.type.code;
                        data.push(tmpData);
                    }
                });
                data.push({
                    'stateRef': 'import.task.scenario',
                    'search': true,
                    'searchInstruction': $filter('translate')('scenario.copyScenario.label_search_instruction'),
                    'caption': $filter('translate')('scenario.copyScenario.label_search_caption')
                });

                $scope.copyScenario = {
                    'title': $filter('translate')('scenario.copyScenario.label_title'),
                    'instruction': $filter('translate')('scenario.copyScenario.label_instruction'),
                    'data': data
                };
            });
        };
        var populateScenarioSkills = function (scenario) {
            var skillHashMap = {};
            $scope.scenarioSkills = [];
            scenario.steps.forEach(function (step) {
                step.skills.forEach(function (skill, index) {
                    if (skillHashMap.hasOwnProperty(skill._id)) {
                        return;
                    }
                    $scope.scenarioSkills.push(skill);
                    skillHashMap[skill._id] = 1;
                });
            });
        };
        $scope.sce = sce;
        $scope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
            if (toState.name === 'content.task.scenario' && fromState.name === 'content.task.scenario') {
                /*
                 Case when same page is called by changing value in URL, prevent stale non-url param
                 */
                toParams.taskId = null;
            }

            else if ((toState.name === 'content.task.scenario') || (fromState.name.indexOf('content.task.scenario') < 0 && toState.name.indexOf('content.task.scenario') >= 0)) {
                /*
                 Case when one returns to this stale page OR from related components to any child page, refresh scenario & hide loader (BR-555, 942)
                 */
                $scope.stepNewCommentCountArray = undefined;
                $scope.$emit('hideLoader');
                /* optional! early hiding motivates better ux as updates transition is slowly shown to user*/

                if ($scope.task.data.friendlyId !== toParams.friendlyId.substring(0, toParams.friendlyId.lastIndexOf('.'))) {
                    /* Case when tasks are different, need to prevent stale non-url param */
                    toParams.taskId = null;
                }
                getScenarioByFriendlyID(toParams.friendlyId);
            }
        });
        $scope.closeSkillDialog = function () {
            $element.find('.skill-dialog .btn.dropdown-toggle').dropdown('toggle');
        };
        $scope.onStepClick = function (stepIndex) {
            state.go('content.task.scenario.step.view', {stepIndex: stepIndex, config: $scope.stepConfig});
        };
        $scope.tagSkill = function (stepNum) {
            state.go('skillPopup.tag.grid', {
                friendlyId: friendlyId,
                stepNum: stepNum,
                app: $scope.task.app.split(' ')[0]
            });
        };

        $scope.reorderSteps = function (id, index) {
            scenarioService.updateSteps.update({
                friendlyId: friendlyId,
                stepId: id,
                stepIndex: index
            }, function (scenario) {
                $scope.scenario.updatedBy = scenario.updatedBy;
                $scope.scenario.updatedTimestamp = scenario.updatedTimestamp;
            });
        };
        $scope.showComment = function (index, stepId) {
            var scenarioId = $scope.scenario._id;
            CommentPopupService.showStepPopup('Comments: Step', index, scenarioId, stepId, $scope.stepNewCommentCountArray, function () {
            });
        };

        $scope.showScenarioComment = function (scenarioId, code) {
            ScenarioCommentPopupService.showScenarioModal('Comments: Scenario', scenarioId, $scope.scenarioNewCommentCount);

        };

        $scope.$on('importSkillListener', function () {
            state.go('skillPopup.import.1', {
                friendlyId: friendlyId,
                stepNum: $scope.scenario.steps.length + 1,
                app: $scope.task.app,
                taskId: $scope.scenario._id
            });
        });

        $scope.$on('addStepListener', function () {
            stepService.createStep.save({scenarioId: $scope.scenario.friendlyId, step: {}}, function () {
                getScenarioByFriendlyID($scope.scenario.friendlyId);
                state.go('content.task.scenario.step.edit', {stepIndex: $scope.scenario.steps.length + 1});
            });
        });

        $scope.onBlankScenarioClick = function () {
            $scope.createBlankScenario = false;
            scenarioService.createScenario.save({taskId: $scope.task._id, friendlyId: friendlyId}, {}, function (data) {
                $scope.scenario = data;
                $scope.historyConfig.value = $scope.scenario.friendlyId;
                populateScenarioSkills(data);
                paintPhase();
                populateOptionsModel();
            });
        };

        function populateOptionsModel() {
            $scope.addStep = {
                'title': 'Add New Step',
                'instruction': 'Choose an Option to begin with:',
                'data': [
                    {
                        'thumbnail': 'blank.png',
                        'caption': $filter('translate')('scenario.label_blank'),
                        'event': 'addStepListener'
                    },
                    {
                        'thumbnail': 'skill_index.png',
                        'caption': $filter('translate')('scenario.label_using_skill_index'),
                        'event': 'importSkillListener'
                    },
                    {
                        'stateRef': 'import.task.step',
                        'search': true,
                        'searchInstruction': 'Task Search',
                        'caption': $filter('translate')('scenario.label_using_task_id'),
                        'options': {
                            'stepNum': $scope.stepNum
                        }
                    }
                ]
            };
        }

        getScenarioByFriendlyID($stateParams.friendlyId);
        if ($stateParams.taskId) {
            $scope.paintTaskViewerHeader($stateParams.taskId);
        }

        $scope.changePhase = function (code) {
            scenarioService.phase.update({}, {
                    friendlyId: friendlyId,
                    phaseCode: $scope.scenario.phase.code
                }, function (errors) {

                    if (errors.length) {
                        $scope.phaseChange = {};
                        $scope.phaseChange.popupData = {
                            type: 'error',
                            title: 'Oops!',
                            body: {
                                message: 'Unable to change phase due to following reasons:',
                                list: errors
                            }
                        };
                        $scope.phaseChange.showModal = true;
                        $timeout(function () {
                            $scope.scenario.phase = $filter('filter')($scope.phases, ('code', code))[0];
                            $scope.$apply();
                            $element.find('.phase-dropdown').selectpicker('refresh');
                        });
                    }
                    else// reload this state
                        state.transitionTo(state.current, $stateParams, {reload: true, inherit: true, notify: true});
                },
                function (err) {
                    if (err.status === 403) {
                        $scope.phaseChange = {};
                        $scope.phaseChange.popupData = {
                            type: 'error',
                            title: 'Oops!',
                            body: {
                                message: 'You are not allowed to change the phase of the task!'
                            }
                        };
                        $scope.phaseChange.showModal = true;
                        $timeout(function () {
                            $scope.scenario.phase = $filter('filter')($scope.phases, {'code': code})[0];
                            $scope.$apply();
                            $element.find('.phase-dropdown').selectpicker('refresh');
                        });
                    }
                });
        };
        $scope.onMetaDataEditClick = function () {

            $scope.metaData = {};
            $scope.metaData.task = {};
            $scope.metaData.task = {};
            $scope.metaData.task.data = {};
            $scope.metaData.task.data.pageNo = $scope.task.data.pageNo;
            $scope.metaData.task.data.eTextURL = $scope.task.data.eTextURL;
            $scope.metaData.task.data.videoURL = $scope.task.data.videoURL;
            $scope.metaData.scenario = {};
            $scope.metaData.scenario.levelOfRevision = $scope.scenario.levelOfRevision;
            $scope.metaData.scenario.difficulty = ($scope.scenario.difficulty === -1) ? null : $scope.scenario.difficulty;
            lastSavedMetaData = angular.copy($scope.metaData);
            $timeout(function () {
                $element.find('#task-meta-data-modal .selectpicker').selectpicker('render');
                $element.find('#task-meta-data-modal').modal('show');
            });
        };
        $scope.updateMetaData = function () {
            var taskMetaDataPromise, scenarioMetaDataPromise, scenarioMetaDataCopy;
            var promiseArray = [];
            if (!angular.equals(lastSavedMetaData.task.data, $scope.metaData.task.data)) {
                $scope.metaData.task._id = $scope.task._id;
                $scope.metaData.task.data.friendlyId = $scope.task.data.friendlyId;
                taskMetaDataPromise = $scope.updateTaskMetadata($scope.metaData.task);
                promiseArray.push(taskMetaDataPromise);
            }
            if (!angular.equals(lastSavedMetaData.scenario, $scope.metaData.scenario)) {
                scenarioMetaDataCopy = angular.copy($scope.metaData.scenario);
                if (scenarioMetaDataCopy.difficulty === null) {
                    scenarioMetaDataCopy.difficulty = -1;
                }
                scenarioMetaDataPromise = scenarioService.updateScenario.update({friendlyId: friendlyId}, scenarioMetaDataCopy, function () {
                    getScenarioByFriendlyID(friendlyId);
                });
                promiseArray.push(scenarioMetaDataPromise);
            }
            $q.all(promiseArray).then(function () {
                $element.find('#task-meta-data-modal').modal('hide');
            });

        };
        $scope.difficultyChange = function () {
            if ($scope.metaData.scenario.difficulty && ($scope.metaData.scenario.difficulty.toString().length > 3)) {
                $scope.metaData.scenario.difficulty = parseFloat($scope.metaData.scenario.difficulty.toString().slice(0, 3));
            }
        };

        $scope.$on('documentUpdate', function () {
            getScenarioByFriendlyID(friendlyId);
        });
        $scope.onURLClick = function ($event) {
            var url = $($event.target).attr('href'),
                urlRegExp = /^(http(s?):\/\/)/;

            if (!urlRegExp.test(url)) {
                window.open('http://' + $($event.target).attr('href'));
            }
        };

        $scope.onScenarioStatusChange = function(){
            scenarioService.status.update({
                friendlyId: $scope.scenario.friendlyId,
                isActive: !$scope.scenario.isActive
            }, function (obj) {
                $scope.scenario.isActive = obj.status;
                notificationService.showNotification(
                    {
                        heading: $filter('translate')('common.label.label_confirmation'),
                        message: $filter('translate')('common.label.label_scenario_status') + ($scope.scenario.isActive ? '"' + $filter('translate')('common.label.label_active') + '"': '"' + $filter('translate')('common.label.label_inactive') + '"')
                    }
                );
            });
        };
    }]];
});
