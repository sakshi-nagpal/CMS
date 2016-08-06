'use strict';

var XLSX = require('xlsx'),
    mongoose = require('mongoose'),
    SkillCategory = mongoose.model('SkillCategory'),
    Skill = mongoose.model('Skill'),
    LibrarySteps = mongoose.model('LibraryStep'),
    Scenario = mongoose.model('Scenario'),
    logger = require('../../../config/loggers/appLogger'),
    Promise = require('bluebird');

var savedSkillObj = {},
    oldSkillsObj,
    validationResult,
    errorObj;

function getKey(json, checkKey){
    var value = '';
    for (var key in json){
        if(key.toLowerCase() === checkKey.toLowerCase()){
            value = json[key];
        }
    }
    return value;
}

function validateChangeInSkills(savedSkillObj, skillValidationObj, mode) {

    return new Promise(function(fulfill, reject) {
        var promiseArr  = [];
        for(var key in savedSkillObj) {
            if(skillValidationObj.hasOwnProperty(key)) {
                for(var objKey in skillValidationObj[key]) {

                    if(typeof skillValidationObj[key][objKey] !== 'object' && skillValidationObj[key][objKey] !== savedSkillObj[key][objKey]) {
                        validationResult['updated'].push({
                            'skillId' : savedSkillObj[key]['skillId'],
                            'title' : savedSkillObj[key]['title']
                        });
                        if(!mode && !errorObj.length) {
                            promiseArr.push(updateSkillsInLibrarySteps(key, savedSkillObj[key]));
                            promiseArr.push(updateSkillsInTaskSteps(key, savedSkillObj[key]));
                        }
                    } else if(skillValidationObj[key][objKey] instanceof Array) {
                        for(var i = 0; i < skillValidationObj[key][objKey].length; i++) {
                            if(skillValidationObj[key][objKey][i] !== savedSkillObj[key][objKey][i]) {
                                validationResult['updated'].push({
                                    'skillId' : savedSkillObj[key]['skillId'],
                                    'title' : savedSkillObj[key]['title']
                                });
                                if(!mode && !errorObj.length) {
                                    promiseArr.push(updateSkillsInLibrarySteps(key, savedSkillObj[key]));
                                    promiseArr.push(updateSkillsInTaskSteps(key, savedSkillObj[key]));
                                }
                                break;
                            }
                        }
                    }
                }
                delete savedSkillObj[key];
                delete skillValidationObj[key];
            }
            else {
                validationResult['added'].push({
                    'skillId' : savedSkillObj[key]['skillId'],
                    'title' : savedSkillObj[key]['title']
                });
                delete savedSkillObj[key];
                delete skillValidationObj[key];
            }
        }
        if(Object.getOwnPropertyNames(skillValidationObj).length) {
            for(var key in skillValidationObj) {
                promiseArr.push(pushDeletedSkills(skillValidationObj[key], promiseArr, mode));
            }

            Promise.all(promiseArr).then(function() {
                fulfill(validationResult)
            });

        } else {
            Promise.all(promiseArr).then(function() {
                fulfill(validationResult)
            });
        }
    });
}

function pushDeletedSkills(skillObj, promiseArr, mode) {
    var libraryStep;
    return LibrarySteps.find({'skills.skillId': skillObj['skillId']}, {name: 1}).exec().then(function(libStep) {
        libraryStep = libStep;
        return Scenario.find({'steps.skills.skillId' : skillObj['skillId']}, {friendlyId : 1}).exec().then(function(scenarioStep) {
            if(!mode && !errorObj.length) {
                promiseArr.push(deleteSkillsInLibrarySteps(skillObj['skillId']));
                promiseArr.push(deleteSkillsInTaskSteps(skillObj['skillId']));
            }
            return validationResult['deleted'].push({
                'skillId' : skillObj['skillId'],
                'title' : skillObj['title'],
                'mappedLibrarySteps' : libraryStep,
                'mappedScenarioStep' : scenarioStep
            });
        })
    })
}

function updateSkillsInLibrarySteps(skillId, skillData) {

    LibrarySteps.find({'skills.skillId' : skillId}).exec().then(function(steps) {
        steps.forEach(function(step) {
            var libraryStep = step;
            libraryStep.skills.forEach(function(skill) {
                if(skill.skillId === skillId) {
                    skill.title = skillData.title;
                    skill.app = skillData.app;
                }
            });
            libraryStep.save(function(err) {
                if(err) {
                    errorObj.error.push('Can\'t update skill for library step "', libraryStep.name , '"');
                }
            });
        });
    });

}

function updateSkillsInTaskSteps(skillId, skillData) {

    Scenario.find({'steps.skills.skillId' : skillId}).exec().then(function(scenarios) {
        scenarios.forEach(function(scenario) {
            var taskStep = scenario;
            taskStep.steps.forEach(function(step) {
                step.skills.forEach(function(skill) {
                    if(skill.skillId === skillId) {
                        skill.title = skillData.title;
                        skill.app = skillData.app;
                    }
                });
            });
            taskStep.save(function(err) {
                if(err) {
                    errorObj.error.push('Can\'t update skill for library step "', taskStep.name , '"');
                }
            });
        });

    });

}

function deleteSkillsInLibrarySteps(skillId) {
    return LibrarySteps.update({'skills.skillId' : skillId},
        {
            $pull: {
                'skills': {skillId: skillId}
            }
        }, {multi: true}).exec();
}

function deleteSkillsInTaskSteps(skillId) {
    return Scenario.update({'steps.skills.skillId' : skillId},
        {
            $pull: {
                'steps.$.skills': {skillId : skillId}
            }
        }, {multi: true}).exec();
}

function importSkills(sheet, skillObj){
    var workbook = XLSX.readFile(sheet);

    var first_sheet_name = workbook.SheetNames[0];

    /* Get worksheet */
    var rows = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[first_sheet_name]);

    var application = 'Application',
        categoryCol = 'Category',
        subCategoryCol = 'Sub Category',
        skillCol = 'Current Skill Name',
        skillIdCol = 'Skill ID',
        applicationOffice2013 = 'Office 2013',
        applicationOffice2016 = 'Office 2016',
        mappedSkills = 'Mapped Skills';

    var skillMap = {};
    var types = [
        "skill_category",
        "skill_sub_category",
        "skill"
    ];

    var saveSkillDocument = function(level, titles, skillId, app, product,  mappedIds, parent){
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
                        saveSkillDocument(level,titles,skillId,app, product, mappedIds, getKey(skillMap, key))().then(function(){
                            fulfill(getKey(skillMap, key));
                        });
                    }
                    return;
                }
                var entity;
                if (types[level] === 'skill') {
                    var parentLabel = [];
                    for(var i=0;i<(titles.length-1);i++) {
                        parentLabel.push(titles[i]);
                    }
                    var entityId = skillObj.skills[skillId] ? skillObj.skills[skillId]._id : mongoose.Types.ObjectId();
                    entity = new Skill({
                        _id: entityId,
                        title: titles[level],
                        app: app,
                        type: types[level],
                        product: product,
                        skillId: skillId,
                        parentLabels: parentLabel,
                        mappedId: [mappedIds]
                    });
                    savedSkillObj[entity.skillId] = entity;
                } else {
                    entity = new SkillCategory({title: titles[level], type: types[level], product: product});
                }
                entity.parent = parent;
                if(!skillObj.mode) {
                    entity.save(function (err) {
                        if (err) {
                            reject(err);
                        }
                        skillMap[key] = entity;
                        if (level === (titles.length - 1)) {
                            fulfill(entity);
                        } else {
                            level++;
                            saveSkillDocument(level, titles, skillId, app, product, mappedIds, entity)().then(function () {
                                fulfill(entity);
                            });
                        }

                    });
                } else if(skillObj.mode === 'dryrun') {
                    skillMap[key] = entity;
                    if (level === (titles.length - 1)) {
                        fulfill(entity);
                    } else {
                        level++;
                        saveSkillDocument(level, titles, skillId, app, product, mappedIds, entity)().then(function () {
                            fulfill(entity);
                        });
                    }

                }

            });
        }
    };

    var isUniqueSkillId = function(skillId, index) {
        for(var i = 0; i < index; i++) {
            if(rows[i][skillIdCol] === skillId){
                //throw error (Skill Id has to be unique)
                errorObj.push('SkillId has to be unique. The SkillId for row '+ (index+2) +' and row ' + (i+2) + ' is same.');
                return false;
            }
        }
        return true;
    };

    var isValidSkillRows = function(row, index) {
        var isValid = (row[application] ? row[application].trim() : '') &&
            (row[categoryCol] ? row[categoryCol].trim() : '') &&
            (row[subCategoryCol] ? row[subCategoryCol].trim() : '') &&
            (row[skillCol] ? row[skillCol].trim() : '') &&
            (row[skillIdCol] ? row[skillIdCol].trim() : '') &&
            (row[applicationOffice2013] ? row[applicationOffice2013].trim() : '') &&
            (row[applicationOffice2016] ? row[applicationOffice2016].trim() : '');


        if(!isValid) {
            errorObj.push('Invalid row : '+ (index+2) +'. Some skill value is missing.');
            delete oldSkillsObj[row[skillIdCol]];
            return false;
        } else if(row[applicationOffice2013].trim() == 'No' && row[applicationOffice2016].trim() == 'No') {
            errorObj.push('Invalid row : '+ (index+2) +'. Skill must be mapped to atleast one application.');
            delete oldSkillsObj[row[skillIdCol]];
            return false;
        }

        return true;
    };

    var promiseArray = [];
    for (var i=0; i< rows.length; i++) {

        if(isValidSkillRows(rows[i], i) && isUniqueSkillId(rows[i][skillIdCol], i)) {
            var category = rows[i][categoryCol].trim();
            var skill = rows[i][skillCol] ? rows[i][skillCol].trim() : '';
            var skillId = rows[i][skillIdCol];
            var product = rows[i][application];
            if(product === 'PowerPoint'){
                product = 'PPT';
            }
            //Add Application info
            var app =[];
            if(rows[i][applicationOffice2013] === 'Yes') {
                app.push(product + ' 2013');
            }
            if(rows[i][applicationOffice2016] === 'Yes') {
                app.push(product + ' 2016');
            }

            if(rows[i][mappedSkills]) {
                var mappedIds = rows[i][mappedSkills];
            }

            var subCategory = rows[i][subCategoryCol].trim();

            var titles = [category, subCategory, skill];
            promiseArray.push(saveSkillDocument(0, titles ,skillId, app, product, mappedIds, null));
        }
    }

    var count = 0;

    return promiseArray.reduce(function(cur, next) {
        return cur.then(function(data){
            //console.log(count++);
            return next();
        }).catch(function(err){
            logger.error('error saving row: ', count, err);
        });
    }, Promise.resolve())
        .then(function() {

            return validateChangeInSkills(savedSkillObj, oldSkillsObj, skillObj.mode).then(function(validationResult) {
                validationResult['error'] = errorObj;
                if(validationResult.error.length) {
                    validationResult.status = 'Failed';
                }
                return validationResult;
            });

        }).catch(function(err){
            logger.error('error: ', err);
        });

}

exports.importSkillIndex = function(sheetPath, skillObj) {
    oldSkillsObj = skillObj.skills;
    errorObj = [];
    validationResult = {
        status:'Success',
        added : [],
        updated : [],
        deleted: []
    };
    return new Promise(function(fulfill, reject) {
        return importSkills(sheetPath, skillObj).then(function(returnObj){
            fulfill(returnObj);
        }, function(err) {
            reject(err);
        });
    });
};


