'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    fs = require('fs'),
    errorHandler = require('./errors.server.controller'),
    XLSXWriter = require('xlsx-writestream'),
    Promise = require('bluebird'),
    importValidator = require('../modules/content/importValidator'),
    exportSeries = require('../modules/content/export.series.api.server.module'),
    config = require('../../config/config'),
    importSeries = require('../modules/content/import.series.api.server.module'),
    importSkillIndex = require('../modules/content/import.skillIndex.api.server.module.js'),
    exportSkillIndex = require('../modules/content/export.skillIndex.api.server.module.js');

var writer;
/*
to write in xlxs
*/
var writeSheet = function(res, fileName){
    var wb = {};
    wb.SheetNames = ['content'];
    res.writeHead(200, [['Content-Type',  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
        ['Content-Disposition', 'attachment; filename='+fileName+'.xlsx']]);
    writer = new XLSXWriter(wb, {type:'buffer'} /* options */);
    writer.getReadStream().pipe(res);
};

exports.contentExport = function(req, res, next){
    var contentType = req.query.content,
        downloadType;
    console.log("type",contentType);

    if(!contentType)
        return next(new errorHandler.error.MalformedRequest('Please specify content type in query params.'));

    switch(contentType) {
        case 'series':
            var seriesId = req.query.seriesId;
            downloadType = req.query.type;

            if(!seriesId){
                return next(new errorHandler.error.MalformedRequest('Please specify series id in query params')); //check
            }else{

                exportSeries.getSeriesData(seriesId).then(function(series){
                    if(!series)
                        return next(new errorHandler.error.MalformedRequest('Invalid series ID. Please check.'));

                    var title = series._doc.title.replace(/ /g,'_');

                    if(!downloadType) {
                        writeSheet(res, 'SeriesExport_'+title);
                    }
                    exportSeries.export(series).then(function(rows){
                        if(downloadType === 'json'){
                            res.json({rows:rows});
                        } else {
                            writer.addRows(rows);
                            writer.finalize();
                        }
                    }, function(error){
                        return next(new errorHandler.error.ProcessingError(error));
                    }).then(null, function(error){
                        return next(new errorHandler.error.ProcessingError('Error returning data'));
                    });
                }, function(error){
                    return next(new errorHandler.error.ProcessingError('Error getting series: ',error));
                })
            }
            break;

        case 'skill':
            downloadType = req.query.type;
            if(!downloadType) {
                writeSheet(res, 'SkillIndexExport');
            }

            exportSkillIndex.exportSkill().then(function(rows) {
                if(downloadType === 'json') {
                    res.json({rows:rows});
                } else {
                    writer.addRows(rows);
                    writer.finalize();
                }
            }, function(error){
                next(new errorHandler.error.ProcessingError(error));
            }).then(null, function(error){
                next(new errorHandler.error.ProcessingError('Error returning data'));
            });
            break;

        default:
            return next(new errorHandler.error.MalformedRequest('Please specify correct content type in query params.'));
            break;
    }
};

exports.contentImport = function(req, res, next){
    var contentType = req.query.content;
    var importSheetPath, match;

    if(!contentType)
        return next(new errorHandler.error.MalformedRequest('Please specify content type in query params.'));

    switch(contentType) {

        case 'series':
            if(!req.query.seriesId || !req.query.file)
                return next(new errorHandler.error.MalformedRequest('Please specify a series id and a filename.'));


            importSheetPath = config.importSeriesPath + req.query.file;
            if(!fs.existsSync(importSheetPath)){
                return next(new errorHandler.error.MalformedRequest(req.query.file+' file not found.'));
            }

            // todo exact match of exportsheet headers
           /* match = importValidator.validateExcel('series', importSheetPath, false);

            if(!match)
                return next(new errorHandler.error.MalformedRequest('Excel columns don\'t match or Series not specified'));*/

            importSeries.import(req.query.seriesId, importSheetPath, req.query.mode, req).then(function(data){
                res.json(data);
            }, function(error){
                return next(new errorHandler.error.ProcessingError(error));
            });

            break;

        case 'skill':
            var fileName = req.query.file;
            if(!fileName) {
                next(new errorHandler.error.MalformedRequest('Please specify file name in query params.'));
            } else {
                var mode = req.query.mode ? req.query.mode : '';
                importSheetPath = config.importSkillIndexPath + fileName;

                /* match = importValidator.validateExcel('skillIndex', importSheetPath, true);
                 if (!match) {
                 next(new errorHandler.error.MalformedRequest('Excel columns don\'t match the expected.'));
                 }*/

                importSkillIndex.importSkill(importSheetPath, mode).then(function (data) {
                    res.json(data);
                }, function (error) {
                    next(new errorHandler.error.ProcessingError(error));
                });

            }
            break;

        default:
            return next(new errorHandler.error.MalformedRequest('Please specify correct content type in query params.'));
            break;
    }
};
