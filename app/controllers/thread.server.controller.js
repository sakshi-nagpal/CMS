'use strict';
var mongoose = require('mongoose'),
    errorHandler = require('./errors.server.controller'),
    threadApi = require('../modules/thread.api.server.module'),
    Scenario = mongoose.model('Scenario'),
    Q = require('q'),
    Thread = mongoose.model('threads');

exports.addStepThread = function (req, res, next) {
    var scenario = req.scenario;
    var step = req.step;
    threadApi.addStepThread(scenario, step, req.body.text, req.user, function (err, docs) {
        if (err) return next(err);

        res.json(docs);
    });
};

exports.addScenarioThread = function (req, res, next) {
    var scenario = req.scenario;
    threadApi.addScenarioThread(scenario, req.body.text, req.user, function (err, docs) {
        if (err) return next(err);

        res.json(docs);
    });
};

exports.addComment = function (req, res, next) {
    var thread = req.thread;
    threadApi.addComment(thread, req.body.text, req.user, function (err, docs) {
        if (err) return next(err);

        res.json(docs);
    })
};

exports.updateComment = function (req, res, next) {
    var thread = req.thread;
    var comment = req.comment;
    threadApi.updateComment(thread, comment, req.body.text, req.user, function (err, docs) {
        if (err) return next(err);

        res.json(docs);
    });
};

exports.deleteComment = function (req, res, next) {
    var thread = req.thread;
    var comment = req.comment;
    threadApi.removeComment(thread, comment, req.user, function (err, docs) {
        if (err) return next(err);

        res.json(docs);
    });
};

exports.deleteThread = function (req, res, next) {
    var scenario = req.scenario;
    var step = req.step;
    var thread = req.thread;
    threadApi.removeThread(scenario, step, thread, req.user, function (err, docs) {
        if (err) return next(err);

        res.sendStatus(200);
    });
};

exports.deleteScenarioThread = function (req, res, next) {
    var scenario = req.scenario;
    var thread = req.thread;
    threadApi.removeScenarioThread(scenario, thread, req.user, function (err, docs) {
        if (err) return next(err);

        res.sendStatus(200);
    });
};

exports.getStepThreads = function (req, res, next) {
    threadApi.populateUsers(req.step.threads).then(function (threads) {
        res.json(threads);
    }, function (err) {
        return next(err);
    });

};

exports.getScenarioThreads = function (req, res, next) {
    var scenarioThreads = {
        scenario: {
            id: req.scenario._id,
            code: req.scenario.phase.code,
            threads: [],
            stepThreads: []
        }
    };

    threadApi.populateUsers(req.scenario.threads).then(function (threads) {
        scenarioThreads.scenario.threads = threads;

        var promise_chain = Q({});
        var promises = [];

        req.scenario.steps.forEach(function (step, index) {
            var promise_link = threadApi.populateUsers(step.threads);
            promises.push(promise_link);
            promise_chain = promise_chain.then(promise_link.then(function (threads) {
                scenarioThreads.scenario.stepThreads.push({index: index, id: step._id, threads: threads});
            }));
        });

        Q.all(promises).then(function () {
            res.json(scenarioThreads);
        })
    })
};

exports.getStepNewCommentCount = function (req, res, next) {
    var count = threadApi.getStepNewCommentCount(req.scenario, req.step, req.user);
    var result = {stepId: req.step._id, count: count};
    res.json(result);
};

exports.getScenarioNewCommentCount = function (req, res, next) {
    var result = threadApi.getScenarioNewCommentCount(req.scenario, req.user);
    res.json(result);
};

exports.markAsRead = function (req, res, next) {
    threadApi.markCommentAsRead(req.thread, req.comment, req.user, function (err, thread) {
        if (err) return next(err);

        res.json(thread);
    });
};

exports.getScenario = function (req, res, next, id) {
    var query = Scenario.findById(id).populate('threads.thread').populate('steps.threads.thread');
    query.exec(function (err, docs) {
        if (err) return next(err);

        req.scenario = docs;
        return next();
    });
};

exports.getStep = function (req, res, next, id) {
    var step = req.scenario.steps.id(id);
    req.step = step;
    return next();
};

exports.getThread = function (req, res, next, id) {
    var query = Thread.findById(id);
    query.exec(function (err, docs) {
        if (err) return next(err);

        req.thread = docs;
        return next();
    });
};

exports.comment = function (req, res, next, id) {
    var comment = req.thread.comments.id(id);
    req.comment = comment;
    return next();
};
