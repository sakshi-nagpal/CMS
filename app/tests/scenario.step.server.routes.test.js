
'use strict';

var should = require('should'),
    request = require('supertest'),
    app = require('../../server'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Scenario = mongoose.model('Scenario'),
    ScenarioJson = require('./mockData/Scenario'),
    agent = request.agent(app),
    _ = require('lodash');

/**
 * Globals
 */

var credentials, user, scenarioObj, scenarioType, scenarioObject, includeActions, searchTextValueNotExists,
    searchTextValueExists, searchText, sampleStepIndex, sampleStepJson, sampleStepId, skillsData, sampleFinalStepIndex;


describe('Step routes test', function () {

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
            roles: ['contentAuthor']
        });

        searchTextValueExists = ScenarioJson.friendlyId;
        searchTextValueNotExists = 'dummyText';
        sampleStepIndex = 0;
        sampleStepId = '5590ffc8be9b1730042776db';
        sampleFinalStepIndex = 1;
        sampleStepJson = {
            text: 'Updated Step Text',
            _id: '5590ffc8be9b1730042776db',
            methods: [{
                type: 'Mouse',
                primary: true,
                supported: true,
                actions: [{
                    text: 'Click dummy text'
                }, {
                    text: 'On the DATABASE TOOLS tab, in the Relationships group, click the Relationships button.'
                }]
            }]
        };

        // Save a user to the test db and create new scenario object
        user.save(function () {

            //Dummy Scenario Object
            scenarioObject = new Scenario(ScenarioJson);

            //Save Scenario Object
            scenarioObject.save(function (err, data) {
                if (err) {
                    return err;
                }
                scenarioObj = data;
                done();
            });
        });
    });

    it('should reorder steps if user is signed in', function(done) {
        agent.post('/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function (signinErr, signinRes) {
                // Handle signin error
                if (signinErr) done(signinErr);
                agent.put('/scenarios/' + scenarioObj.friendlyId + '/steps/' + sampleStepId + '/index/' + sampleFinalStepIndex + '/reorder')
                    .expect(200)
                    .end(function (err) {
                        if (err) done(err);
                        Scenario.findOne({'friendlyId': scenarioObj.friendlyId}).exec().then(function (scenario) {
                            var steps = scenario.steps;
                            steps.length.should.be.equal(scenarioObj.steps.length);
                            _.isEqual(scenario.toObject().steps[sampleFinalStepIndex], scenarioObj.toObject().steps[sampleStepIndex]);
                            _.isEqual(scenario.toObject().steps[sampleStepIndex], scenarioObj.toObject().steps[sampleFinalStepIndex]);
                            done();
                        });
                    });
            });
    });

    afterEach(function(done) {
        Scenario.remove().exec(function() {
            User.remove().exec(done);
        });
    });

});
