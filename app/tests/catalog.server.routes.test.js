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
 * Catalog routes tests
 */
describe('Catalog API tests', function() {
    beforeEach(function(done) {
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
        user.save(function() {
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

    it('should be able to get a list of catalogs if signed in', function(done) {
        // Create new catalog model instance
        var catalogObj = new Catalog(catalog);

        agent.post('/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function(signinErr, signinRes) {
                // Handle signin error
                if (signinErr) done(signinErr);

                // Save the catalog
                catalogObj.save(function() {
                    // Request catalogs
                    agent.get('/catalog')
                        .end(function (req, res) {
                            // Set assertion
                            res.body.should.be.an.Array.with.lengthOf(1);

                            // Call the assertion callback
                            done();
                        });
                });
            });
    });

    it('should be able to get catalogs by id if signed in', function(done) {
        // Create new catalog model instance
        var catalogObj = new Catalog(catalog);

        // Save the article
        agent.post('/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function(signinErr, signinRes) {
                // Handle signin error
                if (signinErr) done(signinErr);

                // Get the userId
                var userId = user.id;
                catalogObj.save(function() {
                    agent.get('/catalog/' + catalogObj._id)
                        .end(function (req, res) {
                            // Set assertion
                            res.body.should.be.an.Object.with.property('title', catalogObj.title);

                            // Call the assertion callback
                            done();
                        });
                });
            });
    });


    it('should send not found status if catalog id is incorrect', function(done) {

        // Save the article
        agent.post('/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function(signinErr, signinRes) {
                // Handle signin error
                if (signinErr) done(signinErr);

                agent.get('/catalog/' + 'wrongId')
                    .expect(404)
                    .end(function (req, res) {

                        done();
                    });

            });
    });

    afterEach(function(done) {
        User.remove().exec();
        Catalog.remove().exec();
        done();
    });
});
