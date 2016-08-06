'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('../../controllers/errors.server.controller.js'),
    uploadCollectionManager = require('../../util/uploadCollectionManager'),
    Skill = mongoose.model('Skill'),
    SkillMigrator = require('../content/skillIndexMigrator'),
    logger = require('../../../config/loggers/appLogger'),
    Promise = require('bluebird');

function createDummyCollection(data, collectionName) {
    return new Promise(function(fulfill, reject){
        if(data.length === 0){
            fulfill(data);
        }
        return uploadCollectionManager.createCollection(data, collectionName, {
            success: function(){
                removeSkills().then(function(){
                    fulfill(data);
                });
            },
            error:function(err){
                logger.error('Error creating dummy collection', err);
                return fulfill({error:'Error creating dummy collection'+err});
            }
        });
    });
}

function getSkills() {
    return Skill.find({}).exec();
}

function removeSkills() {
    return Skill.find({}).remove().exec();
}

var createSkillMap = function (skillData) {
    var skillMap = {};
    return new Promise(function(fulfill, reject) {
        skillData.forEach(function(skill) {
            var skillObj = {};
            skillObj['_id'] = skill._id;
            skillObj['product'] = skill.product;
            skillObj['parentLabels'] = [];
            skillObj['parentLabels'][0] = skill.parentLabels[0];
            skillObj['parentLabels'][1] = skill.parentLabels[1];
            skillObj['title'] = skill.title;
            skillObj['skillId'] = skill.skillId;
            skillObj['app'] = skill.app;
            skillMap[skill.skillId] = skillObj;
        });
        fulfill(skillMap);
    });
};

exports.importSkill = function(filePath, mode) {
    var skills = [];
    var sheetPath = filePath;
    return getSkills().then(function(data){
        skills = data;
        if(!mode) {
            return createDummyCollection(skills, 'skillBackup');
        }
        else {
            return {};
        }
    }).then(function() {
        return createSkillMap(skills);
    }).then(function(skillMap) {
        return SkillMigrator.importSkillIndex(sheetPath, {skills : skillMap, mode : mode});
    }).then(function(data) {
        if(!mode && data.error.length) {

            var res = data;
            return removeSkills().then(function() {
                return uploadCollectionManager.restoreCollection(Skill, 'skillBackup').then(function() {
                    return res;
                });
            });
        } else {
            return data;
        }
    });
};

exports.createSkillMap = createSkillMap;
