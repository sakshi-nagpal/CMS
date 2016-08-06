'use strict';

var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Capability = mongoose.model('capability');

exports.loginUser = function (agent, credentials, done) {
    if (credentials.username == undefined) {
        var credentials = {
            username: 'username',
            password: 'password'
        };

    }

    var user = new User({
        firstName: 'Full',
        lastName: 'Name',
        displayName: 'Full Name',
        email: 'test@test.com',
        username: credentials.username,
        password: credentials.password,
        provider: 'local',
        roles: ['contentAuthor']
    });


    user.save(function (err, docs) {
        if (err) return done(err);

        agent.post('/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function (err, res) {
                if (err) done(err);
                done();
            });
    });
};

exports.logOut = function () {
    User.remove().exec();
};
