'use strict';

var should = require('should'),
    request = require('supertest'),
    app = require('../../server'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Catalog = mongoose.model('Catalog'),
    agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, catalog;

/**
 * Health routes tests
 */
describe('Health API test', function () {
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
            provider: 'local'
        });

        // Save a user to the test db and create new catalog
        user.save(function () {
            catalog = new Catalog({
                title: 'Catalog Title',
                series: [{
                    title: 'Series 1',
                    thumbnail: 'series1.jpg'
                },
                    {
                        title: 'Series 2',
                        thumbnail: 'series2.jpg'
                    }]
            });

            done();
        });
    });

    it('should be able to send success status for valid db connection if signed in', function (done) {
        // Create new catalog model instance
        var catalogObj = new Catalog(catalog);

        agent.post('/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function (signinErr, signinRes) {
                // Handle signin error
                if (signinErr) done(signinErr);

                // Save the catalog
                catalogObj.save(function () {
                    // Check health route
                    agent.get('/health')
                        .end(function (req, res) {
                            // Check assertion
                            var result = res.body;
                            result.should.be.an.instanceOf(Object);
                            should.not.exist(result.mongoStatus);
                            // Call the assertion callback
                            done();
                        });
                });
            });
    });

    it('should be able to send failure status for invalid db connection if signed in', function (done) {

        agent.post('/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function (signinErr, signinRes) {
                // Handle signin error
                if (signinErr) done(signinErr);

                // Check health route
                agent.get('/health')
                    .end(function (req, res) {
                        // Set assertion
                        var result = res.body;
                        result.should.be.an.instanceOf(Object);
                        result.mongoStatus.should.be.equal('sick');
                        // Call the assertion callback
                        done();
                    });
            });
    });

    afterEach(function (done) {
        User.remove().exec();
        Catalog.remove().exec();
        done();
    });
});
