'use strict';

var mongoose = require('mongoose'),
    Scenario = mongoose.model('Scenario'),
    User = mongoose.model('User'),
    async = require('async'),
    Q = require('q'),
    Promise = require('bluebird'),
    Thread = mongoose.model('threads');

exports.addStepThread = function (scenario, step, text, user, callback) {

    var comment = {text: text, user: user._id, timeStamp: new Date(), isNew: true};
    var thread = new Thread({comments: [{sequence: 0, comment: comment}]});

    thread.save(function (err, threadDocs) {
        if (err) {
            return callback(err);
        }
        var stepIndex = scenario.steps.indexOf(step);
        scenario.steps[stepIndex].threads.push({
            sequence: scenario.steps[stepIndex].threads.length,
            thread: threadDocs
        });
        scenario.save(function (err, scenarioDocs) {
            if (err) return callback(err);

            populateUsersForThreads(scenarioDocs.steps[stepIndex].threads).then(function (threads) {
                callback(null, {threads: threads});
            }, function (err) {
                callback(err);
            });
        });
    });
};

exports.addScenarioThread = function (scenario, text, user, callback) {

    var comment = {text: text, user: user._id, timeStamp: new Date(), isNew: true};
    var thread = new Thread({comments: [{sequence: 0, comment: comment}]});

    thread.save(function (err, threadDocs) {
        if (err) {
            return callback(err);
        }
        scenario.threads.push({
            sequence: scenario.threads.length,
            thread: threadDocs
        });
        scenario.save(function (err, scenarioDocs) {
            if (err) return callback(err);

            populateUsersForThreads(scenarioDocs.threads).then(function (threads) {
                callback(null, {threads: threads});
            }, function (err) {
                callback(err);
            });
        });
    });
};

exports.addComment = function (thread, text, user, callback) {

    thread.comments.push({
        sequence: thread.comments.length,
        comment: {text: text, user: user._id, timeStamp: new Date(), isNew: true}
    });

    thread.save(function (err, threadDocs) {
        if (err) {
            return callback(err);
        }
        var threadDbs = [];
        threadDbs.push({thread: threadDocs});
        populateUsersForThreads(threadDbs).then(function (threads) {
            callback(null, threads[0]);
        }, function (err) {
            callback(err);
        });
    });
};

exports.updateComment = function (thread, comment, text, user, callback) {

    var commentIndex = thread.comments.map(function (comment) {
        return comment._id;
    }).indexOf(comment._id);

    thread.comments[commentIndex].comment.text = text;
    thread.comments[commentIndex].comment.timeStamp = new Date();

    thread.save(function (err, threadDocs) {
        if (err) {
            return callback(err);
        }
        var threadDbs = [];
        threadDbs.push({thread: threadDocs});
        populateUsersForThreads(threadDbs).then(function (threads) {
            callback(null, threads[0]);
        }, function (err) {
            callback(err);
        });
    });
};

exports.removeComment = function (thread, comment, user, callback) {

    var commentIndex = thread.comments.map(function (comment) {
        return comment._id;
    }).indexOf(comment._id);

    thread.comments.splice(commentIndex, 1);

    thread.save(function (err, threadDocs) {
        if (err) {
            return callback(err);
        }
        var threadDbs = [];
        threadDbs.push({thread: threadDocs});
        populateUsersForThreads(threadDbs).then(function (threads) {
            callback(null, threads[0]);
        }, function (err) {
            callback(err);
        });
    });
};

exports.removeThread = function (scenario, step, thread, user, callback) {

    var stepIndex = scenario.steps.map(function (step) {
        return step._id;
    }).indexOf(step._id);

    var threadIndex = scenario.steps[stepIndex].threads.map(function (thread) {
        return thread.thread._id.toString();
    }).indexOf(thread._id.toString());

    scenario.steps[stepIndex].threads.splice(threadIndex, 1);

    scenario.save(function (err, scenarioDoc) {
        thread.remove(function (err, threadDocs) {
            if (err) {
                return callback(err);
            }
            callback(null, threadDocs);
        });
    });
};

exports.removeScenarioThread = function (scenario, thread, user, callback) {

    var threadIndex = scenario.threads.map(function (thread) {
        return thread.thread._id.toString();
    }).indexOf(thread._id.toString());

    scenario.threads.splice(threadIndex, 1);

    scenario.save(function (err, scenarioDoc) {
        if (err) {
            return callback(err);
        }

        thread.remove(function (err, threadDocs) {
            if (err) {
                return callback(err);
            }
            callback(null, threadDocs);
        });
    });
};

exports.removeAllThreadsScenario = function (scenario) {
    scenario = scenario.toJSON();
    var threads = scenario.threads;
    scenario.steps.forEach(function (step) {
        threads = threads.concat(step.threads);
    });

    var promiseArr = [];
    threads.forEach(function (thread) {
        promiseArr.push(Thread.findOneAndRemove({_id: thread.thread}).exec().then(function (thread) {
            return thread;
        }));
    });
    return Promise.all(promiseArr);
};

exports.populateUsers = function (threads) {
    return populateUsersForThreads(threads);
};

var populateUsersForThreads = function (threads) {

    var count = 0;
    var id;
    var opts = [{path: 'comments.comment.user', select: 'displayName'}];

    var deferred = Q.defer();

    async.whilst(
        function () {
            return count < threads.length;
        },
        function (callback) {
            Thread.populate(threads[count].thread, opts, function (err, user) {
                if (err) deferred.reject(err);
                count++;
                callback();
            });
        },
        function (err) {
            if (err) deferred.reject(err);
            deferred.resolve(threads);
        }
    );

    return deferred.promise;
};

exports.getStepNewCommentCount = function (scenario, step, user) {

    var count = 0;


    step.threads.forEach(function (thread) {
        thread.thread.comments.forEach(function (comment) {
            if (comment.comment.isNew && comment.comment.user.toString() != user._id.toString()) {
                count += 1;
            }
        });
    });

    return count;
};

exports.getScenarioNewCommentCount = function (scenario, user) {

    var count = 0;

    scenario.threads.forEach(function (thread) {
        thread.thread.comments.forEach(function (comment) {
            if (comment.comment.isNew && comment.comment.user.toString() != user._id.toString()) {
                count += 1;
            }
        });
    });

    var res = {scenarioId: scenario._id, count: count, steps: []};

    scenario.steps.forEach(function (step) {
        count = 0;
        step.threads.forEach(function (thread) {
            thread.thread.comments.forEach(function (comment) {
                if (comment.comment.isNew && comment.comment.user.toString() != user._id.toString()) {
                    count += 1;
                }
            });
        });
        res.steps.push({stepId: step._id, count: count});
    });

    return res;
};

exports.markCommentAsRead = function (thread, comment, user, callback) {
    var commentIndex = thread.comments.map(function (comment) {
        return comment._id;
    }).indexOf(comment._id);

    thread.comments[commentIndex].comment.isNew = false;

    thread.save(function (err, threadDocs) {
        if (err) {
            return callback(err);
        }
        var threadDbs = [];
        threadDbs.push({thread: threadDocs});
        populateUsersForThreads(threadDbs).then(function (threads) {
            callback(null, threads[0]);
        }, function (err) {
            callback(err);
        });
    });
};

exports.getNewCommentCountByTask = function (task, userId) {

    var promises = [];
    var scenarioCountArray =[];
    task.data.forEach(function (scenarioData) {
        var promise = getNewCommentCountByScenario(scenarioData, userId);
        promise.then(function (commentsCountObj) {
            scenarioData.count = commentsCountObj.count;
            scenarioData.isCommentAvailable = commentsCountObj.isCommentAvailable;
            scenarioCountArray.push(scenarioData);

        });
        promises.push(promise);
    });

    return Q.all(promises).then(function () {
       return scenarioCountArray;
    });
};

function getNewCommentCountByScenario(data, userId) {

    var deferred = Q.defer();
    var threadArray = data.stepThreadIds.concat(data.scenarioThreadIds).toString().split(',');
    threadArray = threadArray.filter(function (e) {
        return e
    });
    var commentsCountObj = {count: 0, isCommentAvailable: false};

    if (threadArray.length > 0) {
        commentsCountObj.isCommentAvailable = true;
    }
    var threadIdsObjectArray = [], i = 0;
    threadArray.forEach(function (threadId) {
        threadIdsObjectArray[i++] = mongoose.Types.ObjectId(threadId);
    });

    Thread.aggregate(
        [{$unwind: '$comments'},
            {$match: {$and: [{"_id": {$in: threadIdsObjectArray}}, {"comments.comment.isNew": true}, {"comments.comment.user": {"$ne": userId}}]}},
            {$group: {"_id": "$_id", count: {$sum: 1}}},
        ], function (err, results) {
            if (err) {
                deferred.reject(err);
            } else {
                var totalCount = 0;
                results.forEach(function (result) {
                    totalCount += result.count;
                });
                commentsCountObj.count = totalCount;
                deferred.resolve(commentsCountObj);

            }
        });

    return deferred.promise;
}
