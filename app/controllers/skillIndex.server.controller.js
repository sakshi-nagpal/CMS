'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    Skill = mongoose.model('Skill'),
    Scenario = mongoose.model('Scenario'),
    LibraryStep = mongoose.model('LibraryStep'),
    ObjectId = mongoose.Types.ObjectId;


exports.skillIndexByApplication = function(req, res,next) {
    var appList = req.param('appList').toString().replace(/\+/g,' ').split(',');

    Skill.find({app:{$in:appList},type:'skill'}).sort({'parentLabels.0': 1,'parentLabels.1': 1})
        .select('skillId title parentLabels app').exec().then(function (data) {
            res.send(data);
        },function(err){
            next(new errorHandler.error.ProcessingError(err));
        });
};


exports.skillIndexByProduct = function(req, res,next) {
    var product = req.param('product');
    Skill.find({product:product,type:'skill'}).sort({'parentLabels.0': 1,'parentLabels.1': 1})
        .select('skillId title parentLabels app product').exec().then(function (data) {
            res.send(data);
        },function(err){
            next(new errorHandler.error.ProcessingError(err));
        });
};



exports.taskStepsBySkillId = function(req, res,next) {

    var skillId = req.param('skillId').toString();

    Scenario.aggregate([
            {$match: {'steps.skills.skillId': skillId}},
            {$unwind: "$steps"},
            {$match: {'steps.skills.skillId': skillId}},
            {$project:{'friendlyId':1,'phase':1,'taskId':1,'steps.methods._id':1,'steps.text':1,
                'steps._id':1,'steps.skills':1, 'updatedTimestamp':1}
            }
        ]).exec().then(function(results){
            res.json(results);
        })
        .then(null,function(err){
            next(err);
        });

};


exports.taskStepCountBySkillsForApps = function(req, res,next) {

    var appList = req.param('appList').toString().replace(/\+/g,' ').split(',');

    Scenario.aggregate([
            { $match: {'steps.skills.app':{$in:appList} } },
            { $unwind : "$steps" },
            {$project:{"steps":"$steps","friendlyId":"$friendlyId"}},
            { $unwind : "$steps.skills" },
            { $group : { _id : "$steps.skills.skillId", count: { $sum: 1 } }}
        ]).exec().then(function(results){
            res.json(results);
        }).then(null,function(err){
            next(err);
        });
};

exports.taskStepCountBySkillsForProduct = function(req, res,next) {


    var product = req.param('product');
    Scenario.aggregate([
        { $match: {'steps.skills.app':{ $regex: new RegExp(product, 'i')} } },
        { $unwind : "$steps" },
        {$project:{"steps":"$steps","friendlyId":"$friendlyId"}},
        { $unwind : "$steps.skills" },
        { $group : { _id : "$steps.skills.skillId", count: { $sum: 1 } }}
    ]).exec().then(function(results){
        res.json(results);
    }).then(null,function(err){
        next(err);
    });
};


exports.libraryStepCountForSkillsByProduct = function(req, res, next) {
    var product = req.params.product;

    LibraryStep.aggregate([
        {$project : {name : 1,
            product : 1,
            app : 1,
            skills : 1}
        },
        {$unwind : '$skills'},
        { $group : { _id : "$skills.skillId", count: { $sum: 1 } }}
    ]).exec().then(function(result) {
        res.json(result);
    }).then(null,function(err){
        next(err);
    });
};


exports.getSkillBySkillId =function(req,res){
    res.send(req.skill);
};

exports.skillBySkillId = function(req,res,next){

    var skillId = req.param('skillId').toString();

    Skill.findOne({skillId : skillId}).exec().then(function(skill) { // get only one element .find() returns array
        if (!skill) {
            throw new errorHandler.error.NotFound('Skill not found');
        }
        req.skill = skill;
        next();
    }).then(null,function(err){
        next(err);
    });
};

exports.categoriesByProduct = function(req, res, next) {
    var product = req.param('product');
    Skill.find({product: product, type: 'skill_category'}, {title: 1}).sort({title:1}).exec().then(function(records) {
        res.send(records);
    }).then(null,function(err){
        next(err);
    });
};

exports.subCategoriesByProduct = function(req, res, next) {
    var product = req.param('product');
    var categoryId = req.param('categoryId');
    Skill.find({product: product, parent : categoryId, type: 'skill_sub_category'}, {title: 1}).sort({title:1}).exec().then(function(records) {
        res.send(records);
    }).then(null,function(err){
        next(err);
    });
};

exports.categoriesWithNestedChildren = function(req, res, next) {
    var product = req.param('product');
    var args = {
        fields: 'title',
        filters: {$or: [{type: 'skill_category'}, {type: 'skill_sub_category'}], product: product}
    };
    Skill.getChildrenTree(args, function(err, tree) {
        if (err) {
            var newErr = new errorHandler.error.NotFound(errorHandler.getErrorMessage(err));
            next(newErr);
        }

        res.json(tree);
    })
};
