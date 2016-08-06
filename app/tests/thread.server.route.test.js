'use strict';

var should = require('should'),
    request = require('supertest'),
    mongoose = require('mongoose'),
    app = require('../../server'),
    Scenario = mongoose.model('Scenario'),
    Threads = mongoose.model('threads'),
    loginHelper = require('./user.common.server.test'),
    agent = request.agent(app);

var scenario, scenarioId, stepId, comment, commentNew;

describe("Thread API testing", function () {

    before(function (done) {

        comment = {text: 'This is a test comment'};
        commentNew = {text: 'This is a new comment'};

        var scenarioDb = new Scenario({
            friendlyId: "TST13.TST13.10.10.00.TSTT1",
            createdBy: {_id: mongoose.Types.ObjectId(), name: "testUser"},
            updatedBy: {_id: mongoose.Types.ObjectId(), name: "testUser"},
            phase: {code: "AUT", index: 1},
            type: {code: "T1", index: 1},
            "steps": [{
                "text": "Use the Form Tool to create a one-to-many form with the Customers fields in the main form and the Orders fields in the subform.",
                "skills": [],
                "methods": []
            }]
        });

        scenarioDb.save(function (err, docs) {
            if (err) return done(err);

            scenario = docs;
            scenarioId = scenario._id;
            stepId = scenario.steps[0]._id;
        });

        loginHelper.loginUser(agent, {}, done);
    });

    var removeStepThread = function (id, done) {
        agent.delete('/threads/scenario/' + scenarioId + '/step/' + stepId + '/thread/' + id)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    done(err);
                    return;
                }
                done();
            });
    };

    var removeScenarioThread = function (id, done) {
        agent.delete('/threads/scenario/' + scenarioId + '/thread/' + id)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    done(err);
                    return;
                }
                done();
            });
    };

    var addStepThread = function (callback) {
        agent.post('/threads/scenario/' + scenarioId + '/step/' + stepId)
            .send(comment)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    callback(err);
                    return;
                }

                callback(null, res);
            });
    };

    it('should add step thread', function (done) {
        addStepThread(function (err, res) {
            if (err) {
                done(err);
                return;
            }
            var threadId = res.body.threads[0].thread._id;
            removeStepThread(threadId, done);
        });
    });

    it('should add scenario thread', function (done) {
        agent.post('/threads/scenario/' + scenarioId)
            .send(comment)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    done(err);
                    return;
                }
                res.body.threads.should.be.instanceof(Array).and.have.lengthOf(1);
                var threadId = res.body.threads[0].thread._id;
                removeScenarioThread(threadId, done);
            });
    });

    it('should remove step thread', function (done) {
        addStepThread(function (err, res) {
            if (err) {
                done(err);
                return;
            }
            var threadId = res.body.threads[0].thread._id;
            removeStepThread(threadId, done);
        });
    });

    it('should remove comment', function (done) {
        addStepThread(function (err, res) {
            if (err) {
                done(err);
                return;
            }
            var threadId = res.body.threads[0].thread._id;
            agent.post('/threads/thread/' + threadId)
                .send(commentNew)
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        done(err);
                        return;
                    }

                    var commentId = res.body.thread.comments[1]._id;

                    agent.delete('/threads/thread/' + threadId + '/comment/' + commentId)
                        .expect(200)
                        .end(function (err, res) {
                            if (err) {
                                done(err);
                                return;
                            }
                            res.body.thread.comments.should.be.instanceof(Array).and.have.lengthOf(1);
                            removeStepThread(threadId, done);
                        });
                });
        });
    });

    it('should edit comment', function (done) {
        addStepThread(function (err, res) {
            if (err) {
                done(err);
                return;
            }
            var threadId = res.body.threads[0].thread._id;
            var commentId = res.body.threads[0].thread.comments[0]._id;
            agent.post('/threads/thread/' + threadId + '/comment/' + commentId)
                .send(commentNew)
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        done(err);
                        return;
                    }
                    var newCommentText = res.body.thread.comments[0].comment.text;
                    newCommentText.should.equal(commentNew.text);
                    removeStepThread(threadId, done);
                });
        });
    });

    it('should add new comment', function (done) {
        addStepThread(function (err, res) {
            if (err) {
                done(err);
                return;
            }
            var threadId = res.body.threads[0].thread._id;
            agent.post('/threads/thread/' + threadId)
                .send(commentNew)
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        done(err);
                        return;
                    }
                    res.body.thread.comments.should.be.instanceof(Array).and.have.lengthOf(2);
                    removeStepThread(threadId, done);
                });
        });
    });

    it('should get all step threads', function (done) {
        addStepThread(function (err, res) {
            if (err) {
                done(err);
                return;
            }
            var threadId = res.body.threads[0].thread._id;
            agent.get('/threads/scenario/' + scenarioId + '/step/' + stepId)
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        done(err);
                        return;
                    }
                    res.body.should.be.instanceof(Array).and.have.lengthOf(1);
                    removeStepThread(threadId, done);
                });
        });
    });

    it('should get all scenario threads', function (done) {
        addStepThread(function (err, res) {
            if (err) {
                done(err);
                return;
            }
            var threadId = res.body.threads[0].thread._id;
            agent.get('/threads/scenario/' + scenarioId)
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        done(err);
                        return;
                    }
                    res.body.scenario.stepThreads.should.be.instanceof(Array).and.have.lengthOf(1);
                    removeStepThread(threadId, done);
                });
        });
    });

    it('should get step new comment count', function (done) {
        addStepThread(function (err, res) {
            if (err) {
                done(err);
                return;
            }
            var threadId = res.body.threads[0].thread._id;
            agent.post('/threads/thread/' + threadId)
                .send(commentNew)
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        done(err);
                        return;
                    }
                    loginHelper.loginUser(agent, {username: 'user1', password: 'password'}, function (err) {
                        if (err) {
                            done(err);
                            return;
                        }

                        agent.get('/threads/count/scenario/' + scenarioId + '/step/' + stepId)
                            .expect(200)
                            .end(function (err, res) {
                                if (err) {
                                    done(err);
                                    return;
                                }
                                res.body.count.should.equal(2);
                                removeStepThread(threadId, done);
                            });
                    });
                });
        });
    });

    it('should get scneario new comment count', function (done) {
        agent.post('/threads/scenario/' + scenarioId)
            .send(comment)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    done(err);
                    return;
                }
                var scenarioThreadId = res.body.threads[0].thread._id;
                addStepThread(function (err, res) {
                    if (err) {
                        done(err);
                        return;
                    }
                    var threadId = res.body.threads[0].thread._id;
                    agent.post('/threads/thread/' + threadId)
                        .send(commentNew)
                        .expect(200)
                        .end(function (err, res) {
                            if (err) {
                                done(err);
                                return;
                            }
                            loginHelper.loginUser(agent, {username: 'user2', password: 'password'}, function (err) {
                                if (err) {
                                    done(err);
                                    return;
                                }
                                agent.get('/threads/count/scenario/' + scenarioId)
                                    .expect(200)
                                    .end(function (err, res) {
                                        if (err) {
                                            done(err);
                                            return;
                                        }
                                        res.body.count.should.equal(1);
                                        res.body.steps[0].count.should.equal(2);
                                        removeStepThread(threadId, function () {
                                            removeScenarioThread(scenarioThreadId, done);
                                        });

                                    });
                            });
                        });
                });
            });
    });

    it('should mark comment as read', function (done) {
        addStepThread(function (err, res) {
            if (err) {
                done(err);
                return;
            }
            var threadId = res.body.threads[0].thread._id;
            agent.post('/threads/thread/' + threadId)
                .send(commentNew)
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        done(err);
                        return;
                    }
                    loginHelper.loginUser(agent, {username: 'user3', password: 'password'}, function (err) {
                        if (err) {
                            done(err);
                            return;
                        }

                        var commentId = res.body.thread.comments[0]._id;

                        agent.post('/threads/read/thread/' + threadId + '/comment/' + commentId)
                            .expect(200)
                            .end(function (err, res) {
                                if (err) {
                                    done(err);
                                    return;
                                }

                                agent.get('/threads/count/scenario/' + scenarioId + '/step/' + stepId)
                                    .expect(200)
                                    .end(function (err, res) {
                                        if (err) {
                                            done(err);
                                            return;
                                        }
                                        res.body.count.should.equal(1);
                                        removeStepThread(threadId, done);
                                    });
                            });
                    });
                });
        });
    });

    after(function (done) {
        Scenario.findByIdAndRemove(scenarioId, function (err, docs) {
            if (err) return done(err);
            loginHelper.logOut();
            done();
        });
    });

})
