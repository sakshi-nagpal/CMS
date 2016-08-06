'use strict';


var should = require('should'),
    request= require('supertest'),
    app = require('../../server'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    SIM5Config = mongoose.model('SIM5Config'),
    Capability = mongoose.model('capability'),
    sim5 = require('./mockData/sim5config'),
    agent = request.agent(app);

/**
 * Global variables
 */
var credentials, user, sim5configObj, capability;

describe('sim5config Routes Tests',function(){

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
            roles: ['developer']
        });

        capability = new Capability({
            "capability" : "launch_simulation",
            "roles" : [
                "contentAuthor",
                "systemAdmin",
                "mediaVendor",
                "devContentAdmin",
                "contentReviewer",
                "customerReviewer",
                "developer",
                "editorialAuthor",
                "mediaVendor",
                "softwareTester"
            ]
        })

        user.save(function(err, data) {
            user = data;
                sim5configObj = new SIM5Config(sim5.sim5configData);
                sim5configObj.save(function(err, data){
                    if(err){
                        return err;
                    }
                    sim5configObj = data;
                    done();

                });
        })
    });


    it('should get config for role if the user is signed in', function(done) {
        agent.post('/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function (signinErr, signinRes) {
                // Handle signin error
                if (signinErr) done(signinErr);
                agent.get('/sim5config/options/role/'+ 'developer')
                    .expect(200)
                    .end(function(err, res) {
                        if(err) done(err);
                        res.body.length.should.be.equal(1);
                        done();
                    });
            });
    });
/*
    it('should show error if there is no role', function(done) {
        agent.post('/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function (signinErr, signinRes) {
                // Handle signin error
                if (signinErr) done(signinErr);
                agent.get('/sim5config/options/role/'+undefined)
                    .expect(404, done);
            });
    });*/

    it('should launch simulation in new window if the user is signed in', function(done) {
        agent.post('/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function (signinErr, signinRes) {
                // Handle signin error
                if (signinErr) done(signinErr);
                agent.get('/sim5config/launch?env=stage&friendlyId=GO13.OF13.01.1A.05.T1')
                    .expect(302,done);

            });
    });

    it('should show error if there is no env', function(done) {
        agent.post('/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function (signinErr, signinRes) {
                // Handle signin error
                if (signinErr) done(signinErr);
                agent.get('/sim5config/launch?friendlyId=GO13.OF13.01.1A.05.T1')
                    .expect(400, done);
            });
    });


    afterEach(function(done) {
        SIM5Config.remove().exec(function() {
                User.remove().exec(done);


        });
    });
});


