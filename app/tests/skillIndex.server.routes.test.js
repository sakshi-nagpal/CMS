'use strict';


var should = require('should'),
    request= require('supertest'),
    app = require('../../server'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Skill = mongoose.model('Skill'),
    Scenario = mongoose.model('Scenario'),
    LibraryStep = mongoose.model('LibraryStep'),
    SkillIndexData = require('./mockData/SkillIndex'),
    ScenarioJson = require('./mockData/Scenario'),
    Library = require('./mockData/libraryStep'),
    agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, skillObj, scenarioObj, libraryObj;

describe('SkillIndex Routes Tests',function(){

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
            provider: 'local'
        });

        // Save a user to the test db and create new scenario object
        user.save(function(){

            //Dummy Skill Object
            skillObj = new Skill(SkillIndexData.skillData);
            scenarioObj=new Scenario(ScenarioJson);

            Library.libraryStepData.skills[0] = skillObj;
            Library.libraryStepData.createdBy = user;
            Library.libraryStepData.product = 'PPT';

            //Save skill Object
            skillObj.save(function(err,data){
                if(err){
                    return err;
                }
                skillObj = data;

                //save scenario object
                scenarioObj.save(function (err,data) {
                        if(err){
                            return err;
                        }

                        scenarioObj = data;
                        Library.libraryStepData.skills[0] = skillObj;
                        Library.libraryStepData.createdBy = user;
                        Library.libraryStepData.mappedSteps[0].scenarioId = scenarioObj._id;
                        Library.libraryStepData.mappedSteps[0].stepId = scenarioObj.steps[0]._id;
                        libraryObj = new LibraryStep(Library.libraryStepData);
                        libraryObj.save(function(err, data) {
                            if(err) {
                                return err;
                            }

                            libraryObj = data;
                            done();
                        });
                    }
                );

            });


        });

    });

     it('Should fetch the skills if user is signed in',function (done) {

         agent.post('/auth/signin')
             .send(credentials)
             .expect(200)
             .end(function (signinErr, signinRes) {
                 // Handle signin error
                 if (signinErr) done(signinErr);
                 agent.get('/app/' + SkillIndexData.skillData.app[0].toString().replace(/\s/g,'+') + '/skills')
                     .expect(200)
                     .end(function (req, res) {
                         var currentNode = res.body[0];
                         currentNode.should.be.an.Object.with.property('skillId', SkillIndexData.skillData.skillId);
                         currentNode.title.should.be.type('string');
                         currentNode.title.should.not.equal('');

                         done();
                     });
             });
     });

    it('Should get task step count by application',function(done){

        agent.post('/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function (signinErr, signinRes) {
                // Handle signin error
                if (signinErr) done(signinErr);

                agent.get('/products/'+SkillIndexData.skillData.product+'/skills/taskSteps/count')
                    .expect(200)
                    .end(function (req,res) {
                        var currentNode = res.body[0];
                        currentNode.should.be.an.Object.with.property('_id', SkillIndexData.skillData.skillId);
                        currentNode.should.be.an.Object.with.property('count', ScenarioJson.steps.length);
                        currentNode.count.should.be.type('number');
                        currentNode._id.should.not.equal('');

                        done();

                    });

            });

    });

    it('Should get library step count by product',function(done){

        agent.post('/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function (signinErr, signinRes) {
                // Handle signin error
                if (signinErr) done(signinErr);

                agent.get('/product/'+ SkillIndexData.skillData.product +'/skills/librarySteps/count')
                    .expect(200)
                    .end(function (req,res) {
                        var currentNode = res.body[0];
                        currentNode.should.be.an.Object.with.property('_id', SkillIndexData.skillData.skillId);
                        currentNode.should.be.an.Object.with.property('count', 1);
                        currentNode.count.should.be.type('number');
                        currentNode._id.should.not.equal('');
                        done();

                    });

            });

    });

    it('Should get task Steps by skill id', function(done){

        agent.post('/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function (signinErr, signinRes) {
                // Handle signin error
                if (signinErr) done(signinErr);

                agent.get('/skills/'+SkillIndexData.skillData.skillId+'/steps')
                    .end(function (req,res) {

                        var currentNode = res.body[0];
                        currentNode.should.be.an.Object.with.property('friendlyId', ScenarioJson.friendlyId);
                        currentNode.phase.code.should.equal(ScenarioJson.phase.code);
                        currentNode._id.should.not.equal('');
                        currentNode.updatedTimestamp.should.not.equal('');
                        done();

                    });

            });
    });


    it('Should get skill by skill id', function(done){

        agent.post('/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function (signinErr, signinRes) {
                // Handle signin error
                if (signinErr) done(signinErr);

                agent.get('/skills/'+SkillIndexData.skillData.skillId)
                    .end(function (req,res) {

                        var currentNode = res.body;
                        currentNode.should.be.an.Object.with.property('skillId', SkillIndexData.skillData.skillId);
                        currentNode._id.should.not.equal('');
                        currentNode.updatedTimestamp.should.not.equal('');
                        done();

                    });

            });
    });

    it('Should return not found status code if skill id is incorrect', function(done){

        agent.post('/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function (signinErr, signinRes) {
                // Handle signin error
                if (signinErr) done(signinErr);

                agent.get('/skills/'+'wrongId')
                    .expect(404)
                    .end(function (req,res) {
                        var currentNode = res.body;
                        currentNode.should.be.an.Object.with.property('message', 'Skill not found');
                        done();
                    });

            });
    });

    //it('Should return array of skill categories for a given product', function(done) {
    //
    //    agent.post('/auth/signin')
    //        .send(credentials)
    //        .expect(200)
    //        .end(function (signinErr, signinRes) {
    //            // Handle signin error
    //            if (signinErr) done(signinErr);
    //
    //            agent.get('/product/PPT/skill/categories')
    //                .expect(200,done)
    //                .end(function (req,res) {
    //                    var currentNode = res.body;
    //                    currentNode.should.be.an.Array.with.lengthOf(1);
    //                    done();
    //                });
    //
    //        });
    //});

    //it('Should return array of skill sub categories for a given product and category', function(done) {
    //
    //    agent.post('/auth/signin')
    //        .send(credentials)
    //        .expect(200)
    //        .end(function (signinErr, signinRes) {
    //            // Handle signin error
    //            if (signinErr) done(signinErr);
    //
    //            var product = 'PPT';
    //            var category = '55a78aff10758f1414b013a1';
    //            agent.get('/product/' + product +'/skill/category/'+ category +'/subcategories')
    //                .expect(200,done)
    //                .end(function (req,res) {
    //                    var currentNode = res.body;
    //                    currentNode.should.be.an.Array.with.lengthOf(1);
    //                    done();
    //                });
    //
    //        });
    //});

    afterEach(function(done) {
        Skill.remove().exec(function() {
            User.remove().exec(function(){
                Scenario.remove().exec(function() {
                    LibraryStep.remove().exec(done);
                });
            });
        });
    });

});
