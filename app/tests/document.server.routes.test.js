'use strict';

var should = require('should'),
    request = require('supertest'),
    mongoose = require('mongoose'),
    fs = require('fs'),
    app = require('../../server'),
    Content = mongoose.model('Content'),
    Scenario = mongoose.model('Scenario'),
    Series = mongoose.model('Series'),
    DocumentCategory = mongoose.model('DocumentCategory'),
    Files = mongoose.model('files'),
    loginHelper = require('./user.common.server.test'),
    agent = request.agent(app);

var task, scenario, buffer, category, series, audioCategory;

describe("Document API testing", function () {

    before(function (done) {

        var seriesDb = new Series({
            "path": "5593c6cf68f5ba600b5f8f25",
            "parent": null,
            "title": "Windows 10",
            "type": "cms_series",
            "data": {
                "documentCategories": [],
                "taxonomy": [{
                    "name": "Series",
                    "view": "0",
                    "index": "1",
                    "type": "cms_series"
                }, {
                    "name": "Volume",
                    "view": "1",
                    "index": "2",
                    "type": "cms_section"
                }, {
                    "name": "Chapter",
                    "view": "1",
                    "index": "3",
                    "type": "cms_chapter"
                }, {
                    "name": "Project",
                    "view": "2",
                    "index": "4",
                    "type": "cms_project"
                }, {
                    "name": "Task",
                    "view": "2",
                    "index": "5",
                    "type": "cms_task"
                }],
                "scenarioTypes": [{
                    "index": 1,
                    "code": "T1"
                }, {
                    "index": 2,
                    "code": "A1"
                }, {
                    "index": 3,
                    "code": "A2"
                }],
                "icon": "Windows10_1"
            }
        });

        var categoryDb = new DocumentCategory({
            "code": "END_DOC",
            "displayName": "End Doc",
            "allowedAmount": "1",
            "notifications": true,
            "order": 1,
            "fileSize": 20971520,
            "capability": "edit_file",
            "allowedPhases": ["AUT"]
        });

        var categoryAudioDb = new DocumentCategory({
            "code": "AUDIO_TIMING_FILE",
            "displayName": "Audio Timing File",
            "allowedAmount": "1",
            "notifications": false,
            "order": 1,
            "fileSize": 20971520,
            "capability": "edit_file",
            "allowedPhases": ["AUT"]
        });

        var content = new Content({
            "parent": null,
            title: "TestContent",
            type: "cms_task",
            app: "Word2013"
        });

        var scenarioDb = new Scenario({
            friendlyId: "TST13.TST13.10.10.00.TSTT1",
            title: "TestScneario01",
            steps: [{
                "text": "Create a new report using the Blank Report Tool.",
                "methods": [{
                    "type": "Ribbon",
                    "actions": [{
                        "text": "Click the CREATE tab."
                    }, {
                        "text": "In the Reports group, click the Blank Report button."
                    }],
                    "supported": false,
                    "primary": true
                }, {
                    "type": "Ribbon",
                    "actions": [{
                        "text": "Click the CREATE tab."
                    }, {
                        "text": "In the Reports group, click the Blank Report button."
                    }],
                    "supported": false,
                    "primary": false
                }]
            }, {
                "text": "Create a new report using the Blank Report Tool.",
                "methods": [{
                    "type": "Ribbon",
                    "actions": [{
                        "text": "Click the CREATE tab."
                    }, {
                        "text": "In the Reports group, click the Blank Report button."
                    }],
                    "supported": false,
                    "primary": true
                }, {
                    "type": "Ribbon",
                    "actions": [{
                        "text": "Click the CREATE tab."
                    }, {
                        "text": "In the Reports group, click the Blank Report button."
                    }],
                    "supported": false,
                    "primary": false
                }]
            }],
            createdBy: {_id: mongoose.Types.ObjectId(), name: "testUser"},
            updatedBy: {_id: mongoose.Types.ObjectId(), name: "testUser"},
            phase: {code: "AUT", index: 1},
            type: {code: "T1", index: 1}
        });

        seriesDb.save(function (err, seriesDbs) {
            if (err) return done(err);
            series = seriesDbs;
            content.parent = series._id;
            scenarioDb.save(function (err, scenarioDbs) {
                if (err) return done(err);
                scenario = scenarioDbs;
                categoryDb.save(function (err, categoryDbs) {
                    category = categoryDbs;
                    content.save(function (err, contentDbs) {
                        if (err) return done(err);
                        task = contentDbs;
                        categoryAudioDb.save(function (err, audioCategoryDbs) {
                            if (err) return done(err);
                            audioCategory = audioCategoryDbs;
                            loginHelper.loginUser(agent, {}, done);
                        });
                    });
                })
            });
        });
    });

    var removeScenarioFile = function (fileId, category, callback) {
        agent.delete('/document/scenario/' + scenario._id + '/category/' + category + '/file/' + fileId)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    callback(err);
                    return;
                }
                callback();
            });
    };

    var uploadScenarioDocument = function (file, category, callback) {
        agent.post('/document/content/' + task._id + '/scenario/' + scenario._id + '/category/' + category)
            .attach('file', file)
            .end(function (err, res) {
                if (err) {
                    callback(err);
                    return;
                }

                callback(null, res);
            });
    };

    it('should upload and delete audio timing file', function (done) {
        var fileId;

        uploadScenarioDocument('./app/tests/sampleAudio.txt', audioCategory._id, function (err, res) {
            if (err) {
                done(err);
                return;
            }
            fileId = res.body._id;
            removeScenarioFile(fileId, audioCategory._id, done);
        });
    });

    it('should fail uploading audio timing file', function (done) {
        var fileId;

        uploadScenarioDocument('./app/tests/sampleAudioIncorrect.txt', audioCategory._id, function (err, res) {
            if (err) {
                done(err);
                return;
            }

            res.body.should.be.an.Object.with.property('message');
            done();
        });
    });

    it('should upload and replace a file', function (done) {
        var fileId, newFileId;

        uploadScenarioDocument('./app/tests/sampleUpload.txt', category._id, function (err, res) {
            if (err) {
                done(err);
                return;
            }
            fileId = res.body._id;
            uploadScenarioDocument('./app/tests/sampleUpload.txt', category._id, function (err, res) {
                if (err) {
                    done(err);
                    return;
                }

                newFileId = res.body._id;
                agent.get('/downloadFile/scenario/' + scenario._id + '/category/' + category._id + '/file/' + fileId)
                    .expect(500)
                    .end(function (err, res) {
                        if (err) {
                            done(err);
                            return;
                        }
                        removeScenarioFile(newFileId, category._id, done);
                    });
            });
        });
    });

    it('should download audio timing file', function (done) {
        var fileId;

        uploadScenarioDocument('./app/tests/sampleAudio.txt', audioCategory._id, function (err, res) {
            if (err) {
                done(err);
                return;
            }
            fileId = res.body._id;
            agent.get('/downloadFile/scenario/' + scenario._id + '/category/' + audioCategory._id + '/file/' + fileId)
                .expect(200)
                .expect('Content-disposition', /txt/)
                .end(function (err, res) {
                    if (err) {
                        done(err);
                        return;
                    }
                    removeScenarioFile(fileId, audioCategory._id, done);
                });
        });
    });

    it('should download list of files', function (done) {
        var fileId;
        uploadScenarioDocument('./app/tests/sampleUpload.txt', category._id, function (err, res) {
            if (err) {
                done(err);
                return;
            }
            fileId = res.body._id;
            agent.post('/downloadFiles')
                .send([fileId])
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        done(err);
                        return;
                    }
                    res.body.should.be.an.Object.with.property('fileName');
                    var fileName = res.body.fileName;
                    agent.get('/downloadFiles/' + fileName + '?fileName=' + scenario.friendlyId)
                        .expect(200)
                        .expect('Content-Type', /zip/)
                        .end(function (err, res) {
                            if (err) {
                                done(err);
                                return;
                            }
                            removeScenarioFile(fileId, category._id, done);
                        });
                });
        });
    });

    it('should download a file', function (done) {
        var fileId;
        uploadScenarioDocument('./app/tests/sampleUpload.txt', category._id, function (err, res) {
            if (err) {
                done(err);
                return;
            }
            fileId = res.body._id;
            agent.get('/downloadFile/' + fileId)
                .expect(200)
                .expect('Content-disposition', /txt/)
                .end(function (err, res) {
                    if (err) {
                        done(err);
                        return;
                    }
                    removeScenarioFile(fileId, category._id, done);
                });
        });
    });

    it('should download a scenario file', function (done) {
        var fileId;
        uploadScenarioDocument('./app/tests/sampleUpload.txt', category._id, function (err, res) {
            if (err) {
                done(err);
                return;
            }
            fileId = res.body._id;
            agent.get('/downloadFile/scenario/' + scenario._id + '/category/' + category._id + '/file/' + fileId)
                .expect(200)
                .expect('Content-disposition', /txt/)
                .end(function (err, res) {
                    if (err) {
                        done(err);
                        return;
                    }
                    removeScenarioFile(fileId, category._id, done);
                });
        });
    });


    it('should download list of scenario files', function (done) {
        var fileId;
        uploadScenarioDocument('./app/tests/sampleAudio.txt', audioCategory._id, function (err, res) {
            if (err) {
                done(err);
                return;
            }
            fileId = res.body._id;
            agent.post('/downloadFiles/scenario/' + scenario._id)
                .send([{fileId: fileId, code: audioCategory.code}, {fileId: "", code: "AUDIO_TIMING_XML"}])
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        done(err);
                        return;
                    }
                    res.body.should.be.an.Object.with.property('fileName');
                    var fileName = res.body.fileName;
                    agent.get('/downloadFiles/' + fileName + '?fileName=' + scenario.friendlyId)
                        .expect(200)
                        .expect('Content-Type', /zip/)
                        .end(function (err, res) {
                            if (err) {
                                done(err);
                                return;
                            }
                            removeScenarioFile(fileId, audioCategory._id, done);
                        });
                });
        });
    });

    it('should download a scenario file', function (done) {
        var fileId;
        uploadScenarioDocument('./app/tests/sampleAudio.txt', audioCategory._id, function (err, res) {
            if (err) {
                done(err);
                return;
            }
            fileId = res.body._id;
            agent.get('/downloadFile/scenario/' + scenario._id + '/category/'
                + audioCategory._id + '/file/' + fileId)
                .expect(200)
                .expect('Content-disposition', /txt/)
                .end(function (err, res) {
                    if (err) {
                        done(err);
                        return;
                    }
                    removeScenarioFile(fileId, audioCategory._id, done);
                });
        });
    });

    after(function (done) {
        Content.findByIdAndRemove(task._id, function (err, docs) {
            if (err) return done(err);
            Scenario.findByIdAndRemove(scenario._id, function (err, docs) {
                if (err) return done(err);
                Files.remove().exec(function (err) {
                    DocumentCategory.remove().exec(function (err) {
                        if (err) return done(err);
                        Content.findByIdAndRemove(series._id, function (err, docs) {
                            loginHelper.logOut();
                            done();
                        });
                    });
                });
            });
        });
    });
});



