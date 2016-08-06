'use strict';

/**
 * Module dependencies.
 */
var skillIndex = require('../../controllers/skillIndex.server.controller');

module.exports = function(app) {

    //skills for a route
    app.route('/app/:appList/skills')
        .get(skillIndex.skillIndexByApplication);

    app.route('/product/:product/skills')
        .get(skillIndex.skillIndexByProduct);

    app.route('/app/:appList/skills/taskSteps/count')
        .get(skillIndex.taskStepCountBySkillsForApps);

    app.route('/products/:product/skills/taskSteps/count')
        .get(skillIndex.taskStepCountBySkillsForProduct);

    app.route('/product/:product/skills/librarySteps/count')
        .get(skillIndex.libraryStepCountForSkillsByProduct);

    app.route('/skills/:skillId/steps')
        .get(skillIndex.taskStepsBySkillId);


    app.route('/skills/:skillId')
        .get(skillIndex.getSkillBySkillId);

    app.route('/products/:product/skills/categories')
        .get(skillIndex.categoriesByProduct);

    app.route('/products/:product/skills/categories/:categoryId/subcategories')
        .get(skillIndex.subCategoriesByProduct);

    app.route('/products/:product/skills/categories/tree')
        .get(skillIndex.categoriesWithNestedChildren);


    app.param('skillId', skillIndex.skillBySkillId);
    
};
