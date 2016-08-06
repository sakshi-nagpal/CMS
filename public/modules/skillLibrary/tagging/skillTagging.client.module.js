'use strict';

define([
    './controllers/skillTagging.client.controller',
    'modules/skillLibrary/common/controllers/skill.grid.client.controller',
    'skillLibraryModule',
    'appModule'
],function(skillTaggingController, SkillGridController){

    var module = ApplicationConfiguration.registerModule('skillTagging',['ui.grid','ui.grid.selection']);

    module
        .controller(skillTaggingController[0], skillTaggingController[1])
        .controller(SkillGridController[0], SkillGridController[1]);
});
