'use strict';
var mongoose = require('mongoose'),
    errorHandler = require('./../../controllers/errors.server.controller.js'),
    Content = mongoose.model('Content'),
    Promise = require('bluebird');

var titleArr = [];
var columns = ['ObjectID','Application', 'Section','Chapter','Project','Task','TaskID'];

var getChildrenData = function(series){
    var promiseArr = [new Promise(function(resolve,reject){
        Content.getChildrenTree(series,  function(err,hierarchy){
            if(err) {
                console.log('error');
                var newErr = new errorHandler.error.NotFound(errorHandler.getErrorMessage(err));
                return resolve({error: newErr});
            }
            return resolve(hierarchy) ;
        });
    })];
    return Promise.all(promiseArr);

};

var createRow = function(current, depth, rows){
    var column = 0;
    var row = {};
    row[columns[column++]] = current._id.toString();
    row[columns[column++]] = current.app ? current.app : '';

    if(depth == 0){
        titleArr = [];
    }
    titleArr[depth] = current.title;
    titleArr = titleArr.splice(0,(depth+1));
    titleArr.forEach(function(title, index){
        row[columns[column++]] = title;
    });

    if(current.type=='cms_task'){
        row[columns[column++]] = current.data.friendlyId;
    } else {
        /* populate the empty column values with blank */
        while(column < columns.length){
            row[columns[column++]] = '';
        }
    }
    rows.push(row);
    var children = current.children;
    for (var i = 0, len = children.length; i < len; i++) {
        createRow(children[i], depth + 1, rows);
    }
};

exports.getSeriesData = function(seriesId){
    return Content.findById(seriesId).exec();
};

exports.export = function(series){

        return getChildrenData(series)//})
        .then(function(dataList){
            /* throw error received from previous callback*/
            if(dataList.error){
                throw dataList.error;
            }
            dataList = dataList[0]; /* the above function returns an array of array arrays*/
            var rows = [];
            dataList.forEach(function(data){
                createRow(data, 0, rows);
            });

            return rows;

        });
};
