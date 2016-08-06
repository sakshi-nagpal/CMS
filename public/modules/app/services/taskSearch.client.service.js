'use strict';

define ([
], function() {
    return ['TaskSearch',['$resource','$state','notificationService', function ($resource,$state,notificationService) {
        var taskByIdService = $resource('scenarios/exists',{},{'query': {method:'GET', searchText: '@searchText'}});

        return{
            taskByFriendlyId: taskByIdService,
            checkIfFriendlyIdExists: function(taskSearchText, successCB, stateRef, friendlyId, stepNum){
                taskSearchText = $.trim(taskSearchText);
            if(!taskSearchText){
                var settings={
                    message:'Please enter a Task ID'
                };
                notificationService.showNotification(settings);
            }

            else{
                taskByIdService.query({searchText:taskSearchText}, function(taskScenario) {
                    if(taskScenario.exists){
                        if(typeof successCB === 'function')
                            successCB();
                        if(stateRef) {
                            $state.go(stateRef,{friendlyId:friendlyId, sourceFriendlyId:taskScenario.friendlyId, stepNum:stepNum});
                        }
                        else {
                            $state.go('content.task.scenario',{friendlyId:taskScenario.friendlyId, taskId:taskScenario.taskId});
                        }
                    }
                    else{
                        var settings={
                            message:'Please enter valid Task ID'
                        };
                        notificationService.showNotification(settings);
                    }
                });
            }
        }
    };

    }]];
});
