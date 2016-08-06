'use strict';

define ([
], function() {
    return ['skillLibraryService',['$resource', function ($resource) {

        var transformData = function(data) {
            var resultJson = {};
            angular.forEach(data, function(obj) {
                resultJson[obj._id] = obj.count;
            });
            return resultJson;
        };

        return {
            skillListByApplicationType:$resource('/app/:appList/skills',{},
                {
                    'query':  {method:'GET', isArray: true, cache: true, appList: '@appList'}
                }),

            skillListByProduct:$resource('/product/:product/skills',{},
                {
                    'query':  {method:'GET', isArray: true, cache: true, product: '@product'}
                }),

            taskStepsBySkillId:$resource('/skills/:skillId/steps',{},{
                'query':{method:'GET', isArray:true, skillId:'@skillId'
                }
            }),

            skillBySkillId:$resource('/skills/:skillId',{},{
                'query': {method:'GET', skillId: '@skillId'}
            }),

            taskStepCountForSkillsByApp:$resource('/app/:appList/skills/taskSteps/count',{},{
                'query': {method:'GET', appList: '@appList', transformResponse: function(data) {
                    return transformData(angular.fromJson(data));}}
            }),

            taskStepCountForSkillsByProduct:$resource('/products/:product/skills/taskSteps/count',{},{
            'query': {method:'GET', product: '@product', transformResponse: function(data) {
                return transformData(angular.fromJson(data));}}
            }),

            libraryStepCountForSkillsByProduct: $resource('/product/:product/skills/librarySteps/count', {}, {
                'query': {method:'GET', product: '@product', transformResponse: function(data) {
                    return transformData(angular.fromJson(data));}}
            }),

            categoriesByProduct: $resource('/products/:product/skills/categories/tree',{},
                {
                    'query':  {method:'GET', isArray: true, cache: true, product: '@product'}
                }),
            subCategoriesByProduct: $resource('/product/:product/skill/category/:categoryId/subcategories', {product: '@product', categoryId: '@categoryId'})
        };


    }]];
});

