'use strict';

var should = require('should'),
	request = require('supertest'),
	app = require('../../server'),
	mongoose = require('mongoose'),
	User = mongoose.model('User'),
	agent = request.agent(app);

/**
 * Globals
 */
var credentials, user, incorrect_username, incorrect_password, blank_username, blank_password;

/**
 * User routes tests
 */
describe('User Routes tests', function() {
	beforeEach(function(done) {
		// Create user credentials
		credentials = {
			username: 'username',
			password: 'password'
		};

		incorrect_username = {
			username: 'username_wrong',
			password: 'password'
		};

		incorrect_password = {
			username: 'username',
			password: 'password_wrong'
		};

        blank_username = {
            username: '',
            password: 'password'
        };

        blank_password = {
            username: 'username',
            password: ''
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

		// Save a user to the test db and create new article
		user.save(function() {
			done();
		});
	});

	it('should be able to log into the application', function(done) {
		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes) {
				// Handle signin error
				if (signinErr) done(signinErr);

				// Get the userId
				var userId = user.id;

				// Call the assertion callback
				done();

			});
	});

	it('should not be able to log into the application with wrong username', function(done) {
		agent.post('/auth/signin')
			.send(incorrect_username)
			.expect(400)
			.end(function(signinErr, signinRes) {
				// Call the assertion callback
				done(signinErr);
			});
	});

	it('should not be able to log into the application with wrong password', function(done) {
		agent.post('/auth/signin')
			.send(incorrect_password)
			.expect(400)
			.end(function(signinErr, signinRes) {
				// Call the assertion callback
				done(signinErr);
			});
	});

    it('should not be able to log into the application with blank username', function(done) {
        agent.post('/auth/signin')
            .send(blank_username)
            .expect(400)
            .end(function(signinErr, signinRes) {
                // Call the assertion callback
                done(signinErr);
            });
    });

    it('should not be able to log into the application with blank password', function(done) {
        agent.post('/auth/signin')
            .send(blank_password)
            .expect(400)
            .end(function(signinErr, signinRes) {
                // Call the assertion callback
                done(signinErr);
            });
    });

    it('should not be able to log into the application with no credentials', function(done) {
        agent.post('/auth/signin')
            .expect(400)
            .end(function(signinErr, signinRes) {
                // Call the assertion callback
                done(signinErr);
            });
    });

    it('should send 401 if not logged in', function(done) {
        agent.get('/catalog')
            .expect(401)
            .end(function(signinErr, signinRes) {
                // Call the assertion callback

                done(signinErr);
            });
    });

    it('should redirect to requested url if authenticated', function(done) {
        agent.post('/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function(signinErr, signinRes){

                agent.get('/catalog')
                    .expect(200)
                    .end(function(signinErr, signinRes) {
                        // Call the assertion callback
                        done(signinErr);
                    });

            });
    });

    it('should redirect to / on logout', function(done) {

        agent.post('/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function(signinErr, signinRes){

                agent.get('/auth/signout')
                    .expect(302)
                    .end(function(err, res){
                        res.header.location.should.equal('/');
                        done(err);
                    });
            });
    });

	it('should signup with valid data', function(done) {

		var user = {
			firstName: 'test',
			lastName: 'data',
			password: 'password',
			email:'a@a.com',
			username:'dummy'
		}

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes){
				agent.post('/auth/signup')
					.send(user)
					.expect(200)
					.end(function(signupErr, signupRes){
						signupRes.body.displayName.should.equal('test data');
						done(signupErr);
					});
			});

	});
	it('should not signup with blank username, password, email', function(done) {

		var user = {
			firstName: 'test',
			lastName: 'data'
		}

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes){
				agent.post('/auth/signup')
					.send(user)
					.expect(500)
					.end(function(signupErr, signupRes){
						done(signupErr);
					});
			});

	});

	it('should not change password if not provided', function(done) {

		var passwordDetails = {};

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes){
				agent.post('/users/password')
					.send(passwordDetails)
					.expect(400)
					.end(function(passwordErr, response){
						done(passwordErr);
					});
			});

	});
	it('should not change password if current password not provided', function(done) {

		var passwordDetails = {
			newPassword: 'password'
		};

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes){
				agent.post('/users/password')
					.send(passwordDetails)
					.expect(400)
					.end(function(passwordErr, response){
						console.log(response.body);
						done(passwordErr);
					});
			});

	});

	it('should not change password if current password does not match verify password', function(done) {

		var passwordDetails = {
			newPassword: 'passwordnew',
			currentPassword:'password'
		};

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes){
				agent.post('/users/password')
					.send(passwordDetails)
					.expect(400)
					.end(function(passwordErr, response){
						done(passwordErr);
					});
			});

	});

	it('should change password if current password matches verify password', function(done) {

		var passwordDetails = {
			newPassword: 'passwordnew',
			verifyPassword: 'passwordnew',
			currentPassword:'password'
		};

		agent.post('/auth/signin')
			.send(credentials)
			.expect(200)
			.end(function(signinErr, signinRes){
				agent.post('/users/password')
					.send(passwordDetails)
					.expect(200)
					.end(function(passwordErr, response){
						done(passwordErr);
					});
			});

	});

	afterEach(function(done) {
		User.remove().exec();
		done();
	});
});
