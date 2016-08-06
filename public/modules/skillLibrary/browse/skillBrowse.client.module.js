'use strict';
define([
    './controllers/skillBrowse.client.controller',
    'modules/skillLibrary/common/controllers/skill.grid.client.controller',
    'modules/skillLibrary/common/controllers/skill.stepsList.client.controller',
    'productService',
    'stepService',
    'skillLibraryModule',
    'appModule'

],function(SkillBrowseController,GridController,StepslistController,productService, stepService){
    var module = ApplicationConfiguration.registerModule('skillBrowse',['ui.grid','ui.grid.selection']);

    module
        .factory(productService[0],productService[1])
        .factory(stepService[0],stepService[1])
        .controller(SkillBrowseController[0], SkillBrowseController[1])
        .controller(GridController[0], GridController[1])
        .controller(StepslistController[0], StepslistController[1]);
});

