'use strict';

var mongoose = require('mongoose'),
    content = require('../../models/content.server.model'),
    task = require('../../models/task.server.model'),
    Content = mongoose.model('Content'),
    scenario = require('../../models/scenario.server.model'),
    Scenario = mongoose.model('Scenario'),
    Task = mongoose.model('Task'),
    init = require('../../../config/init')(),
    config = require('../../../config/config'),
    Promise = require('bluebird'),
    fs = require('fs'),
    logger = require('../../../config/loggers/appLogger'),
    XLSXWriter = require('xlsx-writestream'),
    exportedData = [],
    _ = require('lodash');

Promise.promisifyAll(fs);

var writer, workbook;
var columns = ['Series','Section', 'Chapter', 'Project', 'Task Name', 'Task Status', 'Task ID', 'Scenario','Phase','Scenario Status', 'Level'];

//get all tasks from BALOO-DB
var getBalooTaskDocuments = function(req, next) {
        return Content.find({path: new RegExp(req.params.id),type:'cms_task'}).exec();
};

var getAncestors = function(element, row, column) {
    return new Promise(function(fulfill) {
        element.getAncestors(function(err, ancestors){
            ancestors.forEach(function(node, i){
                row[columns[column++]]= node.title;
            });
            fulfill(row);

        });
    });
};

var exportHierarchyForTask = function(task) {
    return new Promise(function(resolve,reject){
        //adding type and phase
        Scenario.find({'taskId': task._id},{'_id':0,'type.code':1,'phase.code':1, 'levelOfRevision':1, 'isActive':1})
            .exec().then(function(data){
                resolve(data);
            },function(err){
                reject(err);
            });
    }).then(function(data){
           return new Promise(function(fulfill){
               var row = {};
               var column = 0;
                getAncestors(task,row, column).then(function(row){
                   column = Object.keys(row).length;
                   var rows = [];
                   var taskJson  = task.toJSON();
                   row[columns[column++]]= taskJson.title;
                   row[columns[column++]]= taskJson.data.isActive? 'Active' : 'Inactive';
                   row[columns[column++]]= taskJson.data.friendlyId;

                   for(var i=0; i<data.length; i++){
                       var index = column;
                       var cloneRow ={};    
                        _.extend(cloneRow,row);
                       cloneRow[columns[index++]]= data[i].type.code;
                       cloneRow[columns[index++]]= data[i].phase.code;
                       cloneRow[columns[index++]]= data[i].isActive? 'Active' : 'Inactive';
                       cloneRow[columns[index++]]= data[i].levelOfRevision  === -1 ? '-':data[i].levelOfRevision;
                       rows.push(cloneRow);
                   }
                   fulfill(rows);
                })
           })
        });
};


 var exportData = function(req, res , next) {
     exportedData = [];
     getBalooTaskDocuments(req, next).then(function(tasks) {
        var promiseArray = [];
         tasks.forEach(function (task){
            var promise = exportHierarchyForTask(task);
            promiseArray.push(promise);
            promise.then(function(rows){
                rows.forEach(function(row){
                    exportedData.push(row);
                })

            });
         });
        return Promise.all(promiseArray);

    }).then(function() {

         exportedData.sort(function(a,b){
             if (a[columns[5]] < b[columns[5]]) //sort on Friendly Id
                 return -1;
             if (a[columns[5]] > b[columns[5]])
                 return 1;
             return 0
         });

         writer.addRows(exportedData);
         writer.finalize();

    }).then(null,function(err) {
         logger.error('error : ', err);
    });
};



exports.exportContentHierarchy = function(req, res,next){
    res.writeHead(200, [['Content-Type',  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    ['Content-Disposition', 'attachment; filename=ContentHierarchy.xlsx']]);
    workbook = {};
    workbook.SheetNames = ['content'];
    writer = new XLSXWriter(workbook, {type:'buffer'} /* options */);
    writer.getReadStream().pipe(res);
    exportData(req ,res, next);
};

