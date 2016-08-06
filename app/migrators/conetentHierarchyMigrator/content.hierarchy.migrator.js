'use strict';

var mongoose = require('mongoose'),
    Content = mongoose.model('Content'),
    Catalog = mongoose.model('Catalog'),
    Series = mongoose.model('Series'),
    Task = mongoose.model('Task'),
    util = require('util'),
    billiConnection = require('../billi/billiConnection'),
    _ = require('lodash');

var request;
var level_array = [

    {
        cms_level: 'cms_series',
        query: 'select * from tblBooks b ' +
        'join tblBooksSeries bs on bs.nSeriesID = b.nSeriesID ' +
        'where nBookID in (%s)',
        columnID: 'nBookID',
        name: 'vcSeriesName'
    },
    {
        cms_level: 'cms_section',
        query: 'select * from tblSections where nBookID = %s order by nSectionPosition',
        columnID: 'nBookID',
        name: 'vcSectionName'
    },
    {
        cms_level: 'cms_chapter',
        query: 'select c.nChapterID, c.vcChapterName, a.vcAppName from tblChapters c ' +
        'join tblChaptersSections cs on c.nChapterID = cs.nChapterID ' +
        'join tblChaptersApps ca on c.nChapterID = ca.nChapterID ' +
        'join tblApps a on ca.nAppID = a.nAppID '+
        'where cs. nSectionID = %s order by cs.vcChapterNo',
        columnID: 'nSectionID',
        name: 'vcChapterName'
    },
    {
        cms_level: 'cms_project',
        query: 'select * from tblProjects where nChapterID = %s',
        columnID: 'nChapterID',
        name: 'vcProjectName'
    },
    {
        cms_level: 'cms_task',
        query: 'select a.vcActivityName, a.nActivityID, app.vcAppName, tas.vcTaskNo, tas.vcPageNos, tas.vcETextURL, tas.vcVideoURL from tblActivities a ' +
        'join tblActivitiesApps aa on a.nActivityID = aa.nActivityID ' +
        'join tblApps app on aa.nAppID = app.nAppID ' +
        'join tblActivitiesSections tas on a.nActivityID = tas.nActivityID ' +
        'where a.nProjectID = %s and aa.bPrimaryApp = \'true\' order by a.nActivityNo',
        columnID: 'nProjectID',
        name: 'vcActivityName'
    }
];

function saveHierarchy(parent, depth, id) {

    depth++;

    var query = util.format(level_array[depth].query, id);

    request.query(query, function (err, recordset) {

        if (err) {

            console.log(query + err);
        }

        if (recordset) {

            var index = 0;

            recordset.forEach(function (node) {

                var title = node[level_array[depth].name];

                title = title.replace(/\&nbsp;/gi, ' ');
                title = title.replace(/\&amp;/gi, '&');
                title = title.replace(/<BR\>/gi, '');

                var element = new Content({
                    title: title,
                    type: level_array[depth].cms_level,
                    app: node.vcAppName,
                    index: index
                });
                element.parent = parent;

                console.log(element.title);

                element.save(function (err) {
                    if (err) {
                        console.log(element.title + err);
                        return;
                    }

                    if (level_array[depth].cms_level === 'cms_task') {

                        Task.findById(element._id).exec(function (error, task) {
                            task.data.pageNo = node.vcPageNos;
                            task.data.friendlyId = node.vcTaskNo;
                            task.data.eTextURL = node.vcETextURL;
                            task.data.videoURL = node.vcVideoURL;
                            task.save();
                        });
                    }


                    if (depth === level_array.length - 1) {
                        return;
                    }
                    if (level_array[depth].cms_level === 'cms_series') {

                        Catalog.update({'series.title': element.title},
                            {$set: {'series.$._id': element._id}}).exec();

                        Series.findOne({
                            title: element.title,
                            'data': {'$exists': true}
                        }).exec(function (error, oldSeries) {
                            Series.findById(element._id).exec(function (error, series) {
                                if (oldSeries) {
                                    series.data = oldSeries.data;
                                    series.save();

                                    var path = new RegExp(oldSeries._id, 'i');

                                    Content.remove({path: {$regex: path}}, function (err) {
                                        if (!err) {
                                            console.log('deleted');
                                        }
                                        else {
                                            console.log('error in deletion');
                                        }
                                    });
                                }
                            });
                        });
                    }

                    saveHierarchy(element, depth, node[level_array[depth + 1].columnID]);
                });

                index++;

            });
        }
    });

}

function migrateContentHierarchy (req, res, next) {

    var bookIds = req.param('bookIds');

    if(bookIds === undefined){
        res.send('Please specify book ids to be migrated.');
        return;
    }

    billiConnection.startTransaction().then(function (sqlObject) {
        request = sqlObject.sqlRequestObject;
        saveHierarchy(null, -1, bookIds);
    });

}

exports.migrateContentHierarchy = migrateContentHierarchy;
