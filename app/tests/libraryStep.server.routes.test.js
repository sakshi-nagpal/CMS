'use strict';


var should = require('should'),
    request= require('supertest'),
    app = require('../../server'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Skill = mongoose.model('Skill'),
    Scenario = mongoose.model('Scenario'),
    LibraryStep = mongoose.model('LibraryStep'),
    Library = require('./mockData/libraryStep'),
    ScenarioJson = require('./mockData/Scenario'),
    agent = request.agent(app);

/**
 * Global variables
 */
var credentials, user, LibraryStepObj, skillObj, scenarioObj;

describe('LibraryStep Routes Tests',function(){

    beforeEach(function(done){


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

        // Save a user to the test db and create new LibraryStep object
        user.save(function(err, data){
            user = data;
            //Dummy Skill Object
            //LibraryStepObj = new LibraryStep(Library.libraryStepData);

            skillObj = new Skill(Library.skillData);

            //Save skill Object
            skillObj.save(function(err,data){
                if(err){
                    return err;
                }
                skillObj = data;
                scenarioObj = new Scenario(ScenarioJson);

                scenarioObj.save(function(err,data){
                    if(err){
                        return err;
                    }
                    scenarioObj = data;

                    Library.libraryStepData.skills[0] = skillObj;
                    Library.libraryStepData.createdBy = user;
                    Library.libraryStepData.updatedBy = user;
                    Library.libraryStepData.mappedSteps[0].scenarioId = scenarioObj._id;
                    Library.libraryStepData.mappedSteps[0].stepId = scenarioObj.steps[0]._id;
                    LibraryStepObj = new LibraryStep(Library.libraryStepData);

                    LibraryStepObj.save(function(err,data) {
                        if (err) {
                            return err;
                        }
                        LibraryStepObj = data;
                        done();
                    });
                });

            });


        });

    });

    it('should get library steps tagged to a skill if the user is signed in', function(done) {
        agent.post('/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function (signinErr, signinRes) {
                // Handle signin error
                if (signinErr) done(signinErr);
                agent.get('/library/skill/id/'+ 'WD_APPLICATION_270' +'/steps')
                    .expect(200)
                    .end(function(err, res) {
                        if(err) done(err);
                        res.body.length.should.be.equal(1);
                        done();
                    });
            });
    });

    it('should create a library step if the step name provided is valid and the user is signed in', function(done){

        var data = {
            stepName: 'this is a test step 2',
            stepData: {
                product: Library.libraryStepData.product,
                skills: Library.libraryStepData.skills
            }
        };

        agent.post('/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function (signinErr, signinRes) {
                // Handle signin error
                if (signinErr) done(signinErr);

                agent.post('/library/step/create')
                    .send(data)
                    .expect(200)
                    .end(function(err, res) {
                        if(err) done(err);
                        res.body.name.should.be.equal(data.stepName);
                        res.body.skills.length.should.be.equal(1);
                        done();
                    });
            });

    });

    it('should get library step by step id if the user is signed in', function(done) {
        agent.post('/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function (signinErr, signinRes) {
                // Handle signin error
                if (signinErr) done(signinErr);
                agent.get('/library/step/'+ LibraryStepObj._id)
                    .expect(200)
                    .end(function(err, res) {
                        if(err) done(err);
                        res.body.name.should.be.equal(Library.libraryStepData.name);
                        done();
                    });
            });
    });

    it('should delete a library step by step id if the user is signed in', function(done) {
        agent.post('/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function (signinErr, signinRes) {
                // Handle signin error
                if (signinErr) done(signinErr);

                agent.delete('/library/step/'+ LibraryStepObj._id)
                    .expect(200)
                    .end(function(err, res) {
                        if(err) done(err);
                        LibraryStep.findOne({name:Library.libraryStepData.name}).exec().then(function(data) {
                            data.length.should.be.equal(0);
                        });
                        done();
                    });
            });
    });

    /*it('should update a library step by step id if the user is signed in', function(done) {
        var updateData = {
            name: 'this is a test step 3',
            status : 'qualified'
        };

        agent.post('/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function (signinErr, signinRes) {
                // Handle signin error
                if (signinErr) done(signinErr);

                agent.put('/library/step/'+ LibraryStepObj._id)
                    .send(updateData)
                    .expect(200)
                    .end(function(err, res) {
                        if(err) done(err);
                        LibraryStep.findOne({name:updateData.name}).exec().then(function(data) {
                            data.length.should.be.equal(1);
                        });
                        done();
                    });
            });
    });*/

    it('should get mapped step details based on the provided scenarioId and stepId if the user is signed in', function(done) {
        agent.post('/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function (signinErr, signinRes) {
                // Handle signin error
                if (signinErr) done(signinErr);
                agent.get('/library/step/'+ LibraryStepObj._id +'/mapped/tasks')
                    .expect(200)
                    .end(function(err, res) {
                        if(err) done(err);
                        res.body[0].friendlyId.should.be.equal(scenarioObj.friendlyId);
                        res.body[0].stepNum.should.be.equal(1);
                        done();
                    });
            });
    });

    afterEach(function(done) {
        LibraryStep.remove().exec(function() {
            Scenario.remove().exec(function() {
                Skill.remove().exec(function() {
                    User.remove().exec(done);
                });
            });
        });
    });
});
