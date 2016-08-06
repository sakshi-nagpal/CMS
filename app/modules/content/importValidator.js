'use strict';

var XLSX = require('xlsx'),
    _ = require('lodash');

var excelTemplate = {
    series: ['ObjectID','Application','Section','Chapter','Project','Task','TaskID'],
    skillIndex: ['Application','Skill ID','Category','Sub Category','Current Skill Name', 'Office 2013', 'Office 2016']
};

exports.validateExcel = function(type, excelPath, strict){

    if(strict == undefined)
        strict = true;

    type = type || 'series';
    var expectedColumns = excelTemplate[type];

    var workbook = XLSX.readFile(excelPath);
    var first_sheet_name = workbook.SheetNames[0];
    var rows = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[first_sheet_name]);
    var match = false;

    var columns = Object.keys(rows[0]);

    if(strict){
        if(expectedColumns.length == columns.length){
            expectedColumns.forEach(function(column,index){
                if((index === 0 || (index > 0 && match)) && column == columns[index]) {
                    match = true;
                } else {
                    match = false;
                }
            });
        }
    } else {
        match = expectedColumns.length == _.intersection(columns, expectedColumns).length;
    }

    return match;

}
