'use strict';

var should = require('should'),
    request = require('supertest'),
    app = require('../../server'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Content = mongoose.model('Content'),
    Series = mongoose.model('Series'),
    Scenario = mongoose.model('Scenario'),
    Thread = mongoose.model('threads'),
    ScenarioJson = require('./mockData/Scenario'),
    agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, scenario, series, element, elementId, taskId,thread,
    view1_taxonomy, view2_taxonomy;
/*
 Content Hierarchy Routes Test
 */

thread=new Thread({
    '_id' : '564bfeb61fba5cfd03bb65e5',
    '__t' : 'threads',
    'comments' : [{
        'sequence' : 0,
        'comment' : {
            'text' : 'Hello',
            'user' : mongoose.Types.ObjectId("55f12f9eaa734e58adefda30"),
            'timeStamp' : '2015-11-18T04:29:42.768Z',
            'isNew' : true
        }
    }]

});
describe('Content API tests', function () {
    beforeEach(function (done) {
        // Create user credentials
        credentials = {
            username: 'username',
            password: 'password'
        };

        // Create a new user
        user = new User({
            firstName: 'Full',
            lastName: 'Name',
            displayName: 'Full Name',
            email: 'test@test.com',
            username: credentials.username,
            password: credentials.password,
            provider: 'local',
            roles: ['systemAdmin']
        });
        // Save a user to the test db and create new officeVersion
        user.save(done());

    });

    beforeEach(function (done) {

        Series.findOne({'type': 'cms_series'}).exec().then(function (data) { //get a series
            series = data;
            view1_taxonomy = series.data.taxonomy.filter(function (taxonomy) { // get view1_taxonomy & view2_taxonomy
                return (taxonomy.view === '1');
            });
            view2_taxonomy = series.data.taxonomy.filter(function (taxonomy) {
                return (taxonomy.view === '2');
            });
            Content.findOne({
                'path': new RegExp(series._id),
                'type': view2_taxonomy[view2_taxonomy.length - 1].type
            }).exec().then(function (data) {
                var elementIndex = view1_taxonomy[view1_taxonomy.length - 1].index - 1;
                elementId = data.path.substr(24 * elementIndex + 2, 24);
                taskId = data._id;
                ScenarioJson.taskId = taskId;
                var scenarioObject = new Scenario(ScenarioJson);

                //Save Scenario Object
                scenarioObject.save(function (err, data) {
                    if (err) {
                        return err;
                    }

                    done();
                });


            });
        }, function (err) {
            done(err);
        });

    });


    it('should get a tree of Series Hierarchy if signed in', function (done) {

        console.log('print');
        agent.post('/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function (signinErr, signinRes) {
                // Handle signin error
                if (signinErr) done(signinErr);
                agent.get('/series/' + series._id + '/hierarchy')
                    .end(function (req, res) {
                        var currentNode = res.body;
                        currentNode.should.be.an.Object.with.property('type', series.type);
                        currentNode.title.should.be.type('string');
                        currentNode.title.should.not.equal('');

                        for (var i in view1_taxonomy) {
                            currentNode = currentNode.children[0];
                            currentNode.should.be.an.Object.with.property('type', view1_taxonomy[i].type);
                            currentNode.title.should.be.type('string');
                            currentNode.title.should.not.equal('');
                        }

                        done();
                    });
            });
    });

    it('should get a tree of Element Hierarchy if signed in', function (done) {

        agent.post('/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function (signinErr, signinRes) {
                // Handle signin error
                if (signinErr) done(signinErr);

                agent.get('/series/' + series._id + '/element/' + elementId + '/hierarchy')
                    .end(function (req, res) {
                        // Set assertion : Check Tree structure & Title
                        var currentNode = res.body;
                        currentNode.should.be.an.Object.with.property('type', view1_taxonomy[view1_taxonomy.length - 1].type);
                        currentNode.title.should.be.type('string');
                        currentNode.title.should.not.equal('');

                        for (var i in view2_taxonomy) {
                            currentNode = currentNode.children[0];
                            currentNode.should.be.an.Object.with.property('type', view2_taxonomy[i].type);
                            currentNode.title.should.be.type('string');
                            currentNode.title.should.not.equal('');
                        }

                        done();
                    });

            });
    });

    it('should get a tree of Element Ancestors if signed in', function (done) {

        agent.post('/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function (signinErr, signinRes) {
                // Handle signin error
                if (signinErr) done(signinErr);

                agent.get('/element/' + elementId + '/ancestors')
                    .end(function (req, res) {
                        // Set assertion : Check Array
                        res.body.should.be.instanceOf(Array).with.lengthOf(view1_taxonomy.length);
                        res.body[0].should.be.an.Object.with.property('type', series.type);
                        res.body[0].title.should.be.type('string');
                        res.body[0].title.should.not.equal('');
                        for (var i = 1; i < view1_taxonomy.length; i++) {
                            res.body[i].should.be.an.Object.with.property('type', view1_taxonomy[i - 1].type);
                            res.body[i].title.should.be.type('string');
                            res.body[i].title.should.not.equal('');
                        }
                        // Call the assertion callback
                        done();
                    });

            });
    });

    it('should get count of child by type if signed in', function (done) {

        agent.post('/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function (signinErr, signinRes) {
                // Handle signin error
                if (signinErr) done(signinErr);

                agent.get('/series/' + series._id + '/parent/' + view1_taxonomy[1].type + '/child/' + view2_taxonomy[0].type + '/count')
                    .end(function (req, res) {

                        for (var i = 0; i < res.body.length - 1; i++) {
                            var currentNode = res.body[i];
                            currentNode.value.should.be.type('number');
                            currentNode._id.should.not.equal('');
                        }
                        done();
                    });

            });
    });

    it('should get scenario phases by type if signed in', function (done) {


             agent.post('/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function (signinErr, signinRes) {
                // Handle signin error
                if (signinErr) done(signinErr);
                     thread.save(function (err, data) {
                         if (err) {
                             return done(err);
                         }
                     });

                     agent.get('/series/' + series._id + '/element/' + elementId + '/task/phases')
                    .end(function (req, res) {
                        res.body.should.be.an.instanceOf(Array);
                        res.body.length.should.be.above(0);
                        for (var i = 0; i < res.body.length; i++) {
                            var currentNode = res.body[i];
                            currentNode._id.should.type('string');
                            currentNode.data[0].type.should.type('string');
                            currentNode.data[0].phase.should.type('string');
                            currentNode.data[0].id.should.type('string');
                            currentNode.data[0].count.should.type('number');
                            currentNode.data[0].isCommentAvailable.should.type('boolean');
                            currentNode.data[0].stepThreadIds.should.be.an.instanceOf(Array);
                            currentNode.data[0].scenarioThreadIds.should.be.an.instanceOf(Array);
                            currentNode.data[0].isCommentAvailable.should.equal(true);
                            currentNode.data[0].count.should.equal(1);
                        }
                        done();
                    });

            });
    });

    it('should get a task by id if signed in', function (done) {

        agent.post('/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function (signinErr, signinRes) {
                // Handle signin error
                if (signinErr) done(signinErr);

                agent.get('/task/' + taskId)
                    .end(function (req, res) {
                        var currentNode = res.body;
                        currentNode.should.be.an.instanceOf(Object).with.properties('title', 'app');
                        currentNode.type.should.be.equal('cms_task');
                        done();
                    });
            });
    });

    it('should update phase of all the scenario in a chapter', function (done) {

        agent.post('/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function (signinErr, signinRes) {
                // Handle signin error
                if (signinErr) return done(signinErr);

                var chapterId = '5593c6cf68f5ba600b5f8f28';
                var taskId = '5593c6cf68f5ba600b5f8f2c';
                var scenario1, scenario2;
                var scenario = new Scenario(ScenarioJson);
                scenario.taskId = mongoose.Types.ObjectId(taskId);
                scenario.save(function (err, scenarioDocs) {
                    if (err) return done(signinErr);

                    scenario = new Scenario(ScenarioJson);
                    scenario.taskId = mongoose.Types.ObjectId(taskId);
                    scenario.save(function (err, scenarioDocs) {
                        if (err) return done(err);

                        scenario2 = scenarioDocs;
                        agent.post('/chapter/' + chapterId + '/update/phase/CQA')
                            .expect(200)
                            .end(function (err, res) {
                                if (err) return done(err);

                                Scenario.findById(scenario2._id, function (err, scenario) {
                                    if (err) return done(err);

                                    scenario.phase.code.should.be.equal('CQA');
                                    done();
                                });
                            });
                    });
                });
            });
    });

    afterEach(function (done) {
        Scenario.remove().exec(function () {
            Thread.remove().exec();
            User.remove().exec(done);
        });
    });

});
