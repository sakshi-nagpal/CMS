'use strict';
define([
    './controllers/skillImport.client.controller',
    'modules/skillLibrary/common/controllers/skill.grid.client.controller',
    'modules/skillLibrary/common/controllers/skill.stepsList.client.controller',
    'modules/skillLibrary/common/controllers/skill.step.client.controller',
    'notificationService',
    'autoResizer',
    'importTaskService',
    'skillLibraryModule',
    'appModule'
    
],function(skillImportController,SkillGridController,SkilStepsListController,
           SkillStepController,notificationService,autoResizerDirective,importTaskService){

    var module = ApplicationConfiguration.registerModule('skillImport',['ui.grid','ui.grid.selection']);

    module
        .controller(skillImportController[0], skillImportController[1])
        .controller(SkillGridController[0], SkillGridController[1])
        .controller(SkilStepsListController[0], SkilStepsListController[1])
        .controller(SkillStepController[0], SkillStepController[1])
        .factory(notificationService[0],notificationService[1])
        .directive(autoResizerDirective[0],autoResizerDirective[1])
        .factory(importTaskService[0],importTaskService[1]);
});
