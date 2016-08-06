'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    threadApi = require('../modules/thread.api.server.module'),
    Q = require('q'),
    Content = mongoose.model('Content'),
    Scenario = mongoose.model('Scenario'),
    Project = mongoose.model('Project'),
    Task = mongoose.model('Task'),
    ObjectId = mongoose.Types.ObjectId,
    DocumentCategory = mongoose.model('DocumentCategory'),
    Series = mongoose.model('Series'),
    _ = require('lodash'),
    ScenarioReference = mongoose.model('ScenarioReference'),
    ScenarioApi = require('../modules/scenario.api.server.module'),
    Promise = require('promise');

var getTaxonomyTypesForView = function (taxonomies, view) {

    var tmp = [];
    var j = 0;
    for (var i in taxonomies) {
        if (taxonomies[i].view === view) {
            var obj = {};
            obj.type = taxonomies[i].type;
            tmp[j] = obj;
            j++;
        }
    }
    return tmp;
};

exports.elementByID = function (req, res, next, id) {

    if (!ObjectId.isValid(id)) {
        throw new errorHandler.error.MalformedRequest('Content id is invalid');
    }

    Content.findById(id).exec().then(function (element) {
        if (!element) {
            throw new errorHandler.error.NotFound('Content not found');
        }
        req.element = element;
        next();
    }).then(null, function (err) {
        next(err);
    });
};

exports.projectByID = function (req, res, next, id) {
    if (!ObjectId.isValid(id)) {
        throw new errorHandler.error.MalformedRequest('Content id is invalid');
    }

    Project.findById(id).populate('data.content_ref.scenario_ref').populate('data.documents.documents.category').populate('data.documents.documents.files').exec().then(function (element) {
        if (!element) {
            throw new errorHandler.error.NotFound('Content not found');
        }
        req.project = element;
        next();
    }).then(null, function (err) {
        next(err);
    });
};


exports.getProjectById = function (req, res, next) {
    res.json(req.project);
};

exports.seriesByID = function (req, res, next, id) {

    if (!ObjectId.isValid(id)) {
        throw new errorHandler.error.MalformedRequest('Series id is invalid');
    }

    Series.findById(id).populate('data.documentCategories.categories').exec().then(function (series) {
        if (!series) {
            throw new errorHandler.error.NotFound('Series not found');
        }
        req.series = series;
        next();
    }).then(null, function (err) {
        next(err);
    });
};

exports.taskById = function (req, res, next) {
    var id = req.param('taskId');
    if (!ObjectId.isValid(id)) {
        throw new errorHandler.error.MalformedRequest('Task id is invalid');
    }

    Task.findById(id).exec().then(function (task) {
        if (!task) {
            throw new errorHandler.error.NotFound('Task not found');
        }
        res.json(task);
    }).then(null, function (err) {
        next(err);
    });
};

exports.isTaskFriendlyIdValid = function (taskFriendlyId) {
    var taskId;
    return Task.find({'data.friendlyId': taskFriendlyId}).exec().then(function (task) {
        if (!task[0]) {
            throw new errorHandler.error.NotFound('Task not found');
        }
        else {
            taskId = task[0]._id;
            return {taskId: taskId, seriesId: task[0].path.split("#")[0]};
        }
    }).then(null, function (err) {
        throw new errorHandler.error.NotFound('Task not found');
    });

};

exports.isScenarioTypeValid = function (seriesId, scenarioType) {
    return Series.findById(seriesId).exec().then(function (series) {
        if (!series) {
            throw new errorHandler.error.NotFound('Series not found');
        }
        else if (_.find(series.data.scenarioTypes, {'code': scenarioType})) {

            return true;
        }
        else {
            throw new errorHandler.error.NotFound('SeriesType not found');
        }
    }).then(null, function (err) {
        throw new errorHandler.error.NotFound('Series not found');
    });
};

exports.hierarchyBySeriesId = function (req, res, next) {
    var series = req.series;
    var seriesJSON = series.toJSON();
    var viewTypes = getTaxonomyTypesForView(seriesJSON.data.taxonomy, '1');
    var args = {
        fields: 'title type app serialNumber',
        filters: {$or: viewTypes},
        options: {sort: {serialNumber: 1}}
    };

    Content.getChildrenTree(series, args, function (err, hierarchy) {
        if (err) {
            var newErr = new errorHandler.error.NotFound(errorHandler.getErrorMessage(err));
            next(newErr);
        }
        seriesJSON.children = hierarchy;
        res.json(seriesJSON);
    });
};

exports.childCountByType = function (req, res, next) {
    var idSize = (req.series._id).toString().length;
    var parentIndex;
    req.series.data.taxonomy.forEach(function (obj) {
        if (obj.type === req.param('parentType')) {
            parentIndex = obj.index - 1;
        }
    });
    Content.aggregate(
        [{$match: {type: req.param('childType'), path: new RegExp(req.param('seriesId'))}},
            {$project: {_id: 1, parentId: {$substr: ['$path', parentIndex * idSize + 2, idSize]}}},
            {$group: {_id: '$parentId', value: {$sum: 1}}}],
        function (err, results) {
            if (err) {
                var newErr = new errorHandler.error.NotFound(errorHandler.getErrorMessage(err));
                next(newErr);
            }

            res.json(results);
        }
    );

    /* Map-Reduce Example

     var taskCountObj = {
     map: function() {
     var parents = (this.path).split('#');
     var chapterId = parents[parents.length - 3];
     emit(chapterId, 1)
     },
     reduce:  function(key, objects) {
     return objects.length;
     },
     query: {type: 'cms_task', path: new RegExp(req.seriesId)},
     out: 'taskCount'
     };
     Content.mapReduce(taskCountObj, function(err, model) {
     // db.projectCount.remove();
     model.find().exec(function (err, taskCount) {
     res.json(taskCount);
     });
     });*/
};
exports.hierarchyByElementId = function (req, res, next) {
    var element = req.element;
    var series = req.series;
    var viewTypes = getTaxonomyTypesForView(series.toJSON().data.taxonomy, '2');
    var args = {
        fields: 'title type app data.friendlyId serialNumber',
        filters: {$or: viewTypes},
        options: {sort: {serialNumber: 1}}
    };

    Content.getChildrenTree(element, args, function (err, hierarchy) {
        if (err) {
            var newErr = new errorHandler.error.NotFound(errorHandler.getErrorMessage(err));
            next(newErr);
        }

        var elementJSON = element.toJSON();
        elementJSON.children = hierarchy;
        res.json(elementJSON);
    });

};

exports.ancestorsByElementId = function (req, res, next) {
    var element = req.element;
    element.getAncestors(function (err, ancestors) {
        if (err) {
            var newErr = new errorHandler.error.NotFound(errorHandler.getErrorMessage(err));
            next(newErr);
        }

        res.json(ancestors);
    });
};

exports.getSeriesByElementId = function (req, res, next) {
    var element = req.element;
    element.getAncestors({type: 'cms_series'}, '_id', function (errParent, series) {
        if (errParent) {
            var newErr = new errorHandler.error.NotFound(errorHandler.getErrorMessage(errParent));
            next(newErr);
        }

        Series.findById(series[0]._id).populate('data.documentCategories.categories').exec(function (err, seriesPopulated) {
            if (err) {
                var newErr = new errorHandler.error.NotFound(errorHandler.getErrorMessage(err));
                next(newErr);
            }
            res.json(seriesPopulated);
        });
    });
};

exports.taskPhasesByElementId = function (req, res) {
    /* var taskPhaseObj1 = {
     map: function() {
     emit(this._id, this.data)},
     reduce: function(key, objects) {return objects.length},
     query: {type: 'cms_task', path: new RegExp(req.param('seriesId'))},
     out: 'result'
     };
     Content.mapReduce(taskPhaseObj1, function(err, model) {
     var taskPhaseObj2 = {
     map: function() {
     emit(this._id, this.phase)},
     reduce: function(key, objects) {return objects.length},
     query: {},
     out: {reduce: 'result'}
     };
     Scenario.mapReduce(taskPhaseObj2, function(err, model) {
     db.collection('result').find().exec(function(err, result){
     res.json(result);
     })
     });
     });*/

    Content.aggregate(
        [{$match: {type: 'cms_task', path: new RegExp(req.param('elementId'))}},
            {$group: {_id: '$type', data: {$push: '$_id'}}}],
        function (err, results) {
            Scenario.aggregate(
                [{$match: {taskId: {$in: results[0].data}}},
                    {
                        $group: {
                            _id: '$taskId',
                            data: {
                                $push: {
                                    id: '$friendlyId',
                                    type: '$type.code',
                                    phase: '$phase.code',
                                    stepThreadIds: '$steps.threads.thread',
                                    scenarioThreadIds: '$threads.thread'
                                }
                            }
                        }
                    }],
                function (err, results) {
                    var promises = [];
                    var userId = req.user._id;
                    var resultsArrayWithCommentsCount = [];
                    results.forEach(function (task) {
                        var promise = threadApi.getNewCommentCountByTask(task, userId);
                        promise.then(function (taskArray) {
                            resultsArrayWithCommentsCount.push({_id: task._id, data: taskArray});
                        });
                        promises.push(promise);
                    });

                    Q.all(promises).then(function () {
                        res.json(resultsArrayWithCommentsCount);
                    });
                }
            );
        }
    );
};


/* Aggregation Example

 exports.hierarchyBySeriesAggregation = function(req, res) {

 var series = null,taxonomy = null;

 Series.aggregate(
 [{ $match : {
 '_id': ObjectId('551506cff46f5ac8221cd3c5')
 }},
 { $unwind : '$data.taxonomy' },
 { $match : {
 'data.taxonomy.view': '1'
 }},
 { $group : {
 _id: {_id:'$_id',title:'$title', path:'$path', type:'$type'},
 taxonomy: {$push: '$data.taxonomy'}
 }}],
 function(err, results) {
 series = results[0]._id;
 taxonomy = results[0].taxonomy;
 for (var x in taxonomy){
 taxonomy[x] = getOnlyTypes(taxonomy[x]);
 }
 var args= {
 fields: 'title type app',
 filters: { $or: taxonomy}
 }

 Content.getChildrenTree(series, args, function(err, hierarchy){
 series.children = hierarchy;
 res.json(series);
 })
 }
 )
 };*/


exports.getAllSeries = function (req, res, next) {
    Content.find({type: "cms_series"}).exec(function (err, series) {
        if (err) {
            var newErr = new errorHandler.error.NotFound(errorHandler.getErrorMessage(err));
            next(newErr);
        }
        res.send(series);
    });
};

exports.updateTask = function (req, res, next) {
    var obj = req.body;
    var id = req.params.taskId;

    Task.findById(id).exec().then(function (task) {
        if (!task) {
            throw new errorHandler.error.NotFound('Task not found');
        }
        var updatedTask = _.extend(task, obj);
        updatedTask.save().then(function () {
            res.json(updatedTask);
        }, function (err) {
            throw err;
        });
    }).then(null, function (err) {
        next(new errorHandler.error.NotFound(errorHandler.getErrorMessage(err)));
    });
};

exports.updateScenarioReference = function (req, res, next) {
    var project = req.project;
    var references = req.body;
    var promiseArray = [];
    references.forEach(function (reference) {
        if (reference.scenario_ref) {
            promiseArray.push(ScenarioReference.findOneAndUpdate(
                {reference_id: reference.scenario_ref.reference_id.toUpperCase()},
                {
                    reference_id: reference.scenario_ref.reference_id.toUpperCase(),
                    reference_name: reference.scenario_ref.reference_name
                }, {
                    upsert: true, new: true
                }).exec());
        }
    });

    Promise.all(promiseArray).then(function (docs) {
        references.forEach(function (reference, i) {
            if (reference.scenario_ref) {
                reference.scenario_ref = _.find(docs, {'reference_id': reference.scenario_ref.reference_id.toUpperCase()})._id;
            }
        });
        project.data.content_ref = references;
        project.save().then(function (project) {
            res.json(true);
        });
    });

};

exports.getScenarioReferences = function (req, res, next) {
    ScenarioReference.find({}).sort({reference_id: 1}).exec().then(function (scenarioReferences) {
        var scenarioRefObj = {
            projectContentRef: req.project.data.content_ref,
            scenarioReferences: scenarioReferences
        };
        res.json(scenarioRefObj);
    });
};

exports.changeTaskStatus = function (req, res, next) {
    var status = req.params.isActive === 'true';
    var taskId = req.params.taskId;

    if (!ObjectId.isValid(taskId)) {
        throw new errorHandler.error.MalformedRequest('Task id is invalid');
    }

    Task.findById(taskId).exec().then(function (task) {

        if (!task) {
            throw new errorHandler.error.NotFound('Task not found');
        }

        task.data.isActive = status;
        task.save().then(function () {
            res.send({status: status});
        }, function (err) {
            next(new errorHandler.error.ProcessingError(errorHandler.getErrorMessage(err)));
        });
    });
};

exports.changePhaseByContent = function (req, res, next) {
    req.element.getChildren({type: "cms_task"}, true, function (err, tasks) {
        if (err) {
            console.log(err);
            return next(err);
        }

        if (tasks === undefined && tasks.length === 0) {
            res.send("No Tasks found");
        }

        var taskIds = tasks.map(function (task) {
            return task._id;
        });

        var phase = _.find(req.app.get('phases'), {'code': req.params.phaseCode}).toObject();
        var promiseChain = [];
        var promise;
        var errorScenarios = {errors: []};
        Scenario.find({taskId: {$in: taskIds}}).populate('documents.category').populate('documents.file').exec(function (err, scenarios) {
            if (err) {
                console.log(err);
                return next(err);
            }

            scenarios.forEach(function (scenario) {
                var scenarioPhase = _.find(req.app.get('phases'), {'code': scenario.phase.code}).toObject();
                if (scenarioPhase.editable) {
                    promise = ScenarioApi.validateScenario(scenario);
                    promiseChain.push(promise);
                    promise.then(function (error) {
                        if (Object.keys(error).length) {
                            errorScenarios.errors.push(scenario);
                        }
                        else {
                            scenario.phase = phase;
                        }
                    }, function (err) {
                        console.log(err);
                        return next(err);
                    });
                }
            });

            Promise.all(promiseChain).then(function () {
                if (errorScenarios.errors.length > 0) {
                    res.json(errorScenarios);
                }
                else {
                    var scenarioIds = scenarios.map(function (scenario) {
                        return scenario._id;
                    });
                    Scenario.update({_id: {$in: scenarioIds}}, {$set: {phase: phase}}, {multi: true}, function (err, docs) {
                        if (err) {
                            console.log(err);
                            return next(err);
                        }

                        res.status(200).send();
                    });
                }
            });
        });
    });
};
