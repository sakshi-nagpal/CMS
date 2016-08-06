'use strict';

define([
    'uiDataGrid',
    'stateChooser',
    'addStep',
    'textSearch',
    'dataTransformer',
    'reSizerService',
    'scenarioService',
    'skillLibraryService',
    'libraryService',
    'productService',
    'angularUIGrid',
    'appModule'
],function(uiDataGridDirective, stateChooserDirective,addStepDirective, lunrSearchService,  dataTransformerService,reSizerService,
           taskScenarioService, skillLibraryService, libraryService, productService){


   var module=ApplicationConfiguration.registerModule('skillLibrary');
    module.directive(uiDataGridDirective[0], uiDataGridDirective[1])
        .directive(stateChooserDirective[0], stateChooserDirective[1])
        .directive(addStepDirective[0], addStepDirective[1])
        .factory(lunrSearchService[0], lunrSearchService[1])
        .factory(dataTransformerService[0], dataTransformerService[1])
        .service(reSizerService[0], reSizerService[1])
        .factory(taskScenarioService[0], taskScenarioService[1])
        .factory(skillLibraryService[0], skillLibraryService[1])
        .factory(libraryService[0], libraryService[1])
        .factory(productService[0],productService[1]);
});
