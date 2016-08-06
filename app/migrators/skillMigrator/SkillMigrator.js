'use strict';

process.env.NODE_ENV = 'development';

var XLSX = require('xlsx'),
    mongoose = require('mongoose'),
    config = require('../../../config/config'),
    skillIndexSchema = require('../../models/skillIndex.server.model'),
    skillSchema = require('../../models/skill.server.model'),
    SkillCategory = mongoose.model('SkillCategory'),
    Skill = mongoose.model('Skill'),
    Promise = require('bluebird');


var db = mongoose.connect(config.dbUri, config.dbOptions, function(err) {
    if (err) {
        console.error('Could not connect to MongoDB!');
        console.log(err.getErrorMessage(err));
    }
});

/*var sheets = [
    {
        file: 'F:/pearson_stash/skill/XL_Skill_Task_Analysis.xlsx',
        sheetNumber : 3,
        application: 'Excel 2013',
        product : 'Excel'
    },
    {
        file: 'F:/pearson_stash/skill/AC_Skill_Task_Analysis.xlsx',
        sheetNumber : 3,
        application: 'Access 2013',
        product : 'Access'
    },
    {
        file: 'F:/pearson_stash/skill/WD_Skill_Task_Analysis.xlsx',
        sheetNumber : 3,
        application: 'Word 2013',
        product : 'Word'
    },
    {
        file: 'F:/pearson_stash/skill/PPT_Skill_Task_Analysis.xlsx',
        sheetNumber : 3,
        application: 'PPT 2013',
        product : 'PPT'
    }
];*/

var sheets = [
    {
        file: 'F:/pearson_stash/skill/Skill_Index_Current.xls',
        sheetNumber : 0
    }
]

function getKey(json, checkKey){
    var value = '';
    for (var key in json){
        if(key.toLowerCase() === checkKey.toLowerCase()){
            value = json[key];
        }
    }
    return value;
}

var readSheet = function(sheet){
    var workbook = XLSX.readFile(sheet.file);

    var first_sheet_name = workbook.SheetNames[sheet.sheetNumber];

    /* Get worksheet */
    var rows = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[first_sheet_name]);

    var categoryCol = 'Category',
        subCategoryCol = 'Sub Category',
        skillCol = 'Current Skill Name',
        skillIdCol = 'Skill ID',
        application = 'Application';

    var skillMap = {};
    var types = [
        "skill_category",
        "skill_sub_category",
        "skill"
    ];

    var checkForEntity = function(level, titles, skillId, app, product, parent){
        return function() {
            return new Promise(function (fulfill, reject) {
                var key = product;
                if (level == 0) {
                    key = key + titles[0];
                } else {
                    for(var i=0;i<=level;i++){
                        key = key+titles[i];
                    }
                }
                if (getKey(skillMap, key)) {
                    if(level === (titles.length-1)){
                        fulfill(getKey(skillMap, key));
                    } else {
                        level++;
                        checkForEntity(level,titles,skillId,app, product,getKey(skillMap, key))().then(function(){
                            fulfill(getKey(skillMap, key));
                        });
                    }
                    return;
                }
                var entity;
                if (types[level] === 'skill') {
                    var parentLabel = [];
                    for(var i=0;i<(titles.length-1);i++){
                        parentLabel.push(titles[i]);
                    }
                    entity = new Skill({
                        title: titles[level],
                        app: [app],
                        type: types[level],
                        product: product,
                        skillId: skillId,
                        parentLabels: parentLabel,
                        mappedId: ''
                    });
                } else {
                    entity = new SkillCategory({title: titles[level], app: [app], type: types[level], product: product});
                }
                entity.parent = parent;
                entity.save(function (err) {
                    if (err) {
                        reject(err);
                    }
                    skillMap[key] = entity;
                    if(level === (titles.length-1)){
                        fulfill(entity);
                    } else {
                        level++;
                        checkForEntity(level,titles,skillId,app,product,entity)().then(function(){
                            fulfill(entity);
                        });
                    }

                });
            });
        }
    }

    var promiseArray = [];
    for (var i=0; i< rows.length; i++) {
        var category = rows[i][categoryCol].trim();
        var skill = rows[i][skillCol] ? rows[i][skillCol].trim() : '';
        var skillId = rows[i][skillIdCol];
        var product = rows[i][application];
        if(product === 'PowerPoint'){
            product = 'PPT';
        }
        var app = product + " 2013";
        var subCategory;

        // check for no value in sub category - replace with name of category
        if (!rows[i][subCategoryCol])
            subCategory = category;
        else {
            subCategory = rows[i][subCategoryCol].trim();
        }

        var titles = [category, subCategory, skill];
        promiseArray.push(checkForEntity(0, titles ,skillId, app, product, null));

    }

    var count = 0;

    promiseArray.reduce(function(cur, next) {
        return cur.then(function(data){
            console.log('then: '+count++);
            return next();
        }).catch(function(err){
            console.log('error saving row: '+count);
        });
    }, Promise.resolve()).then(function() {
        console.log('all executed');
    }).catch(function(err){
        console.log('error: '+err)
    });

};

sheets.forEach(function(sheet){
    readSheet(sheet);
});

