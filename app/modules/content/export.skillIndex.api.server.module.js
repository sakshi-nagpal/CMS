'use strict';

var mongoose = require('mongoose'),
    errorHandler = require('../../controllers/errors.server.controller.js'),
    Skill = mongoose.model('Skill');

exports.exportSkill = function() {
    return Skill.find({type:'skill'}).sort({product: 1, skillId:1}).exec().then(function(skills) {
        var rows = [];
        var skillColumns = {
            app : 'Application',
            skillId : 'Skill ID',
            category : 'Category',
            subCategory : 'Sub Category',
            skillName : 'Current Skill Name',
            office2013 : 'Office 2013',
            office2016 : 'Office 2016'
        };
        //var skillColumns = ['Application','Skill ID','Category','Sub Category','Current Skill Name', 'Office 2013', 'Office 2016'];

        var createSkillRow = function(skillData) {
            var row = {};
            row[skillColumns.app] = skillData.product;
            row[skillColumns.skillId] = skillData.skillId;
            row[skillColumns.category] = skillData.parentLabels[0];
            row[skillColumns.subCategory] = skillData.parentLabels[1];
            row[skillColumns.skillName] = skillData.title;
            if (skillData.app.length === 2) {
                row[skillColumns.office2013] = 'Yes';
                row[skillColumns.office2016] = 'Yes';
            }
            else if(skillData.app[0].split(' ')[1] === skillColumns[5].split[' '][1]) {
                row[skillColumns.office2013] = 'Yes';
                row[skillColumns.office2016] = 'No';
            }  else {
                row[skillColumns.office2013] = 'No';
                row[skillColumns.office2016] = 'Yes';
            }

            rows.push(row);
        };

        skills.forEach(function(skill) {
            createSkillRow(skill);
        });

        return rows;
    });
};
