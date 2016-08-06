'use strict';

var should = require('should'),
    request = require('supertest'),
    app = require('../../server'),
    mongoose = require('mongoose'),
    httpMocks = require('node-mocks-http'),
    User = mongoose.model('User'),
    Scenario = mongoose.model('Scenario'),
    MethodTypeEnum = mongoose.model('methodTypeEnum'),
    Content = mongoose.model('Content'),
    ScenarioTypeEnum = mongoose.model('scenarioTypeEnum'),
    scenarioPhaseEnum = mongoose.model('scenarioPhaseEnum'),
    ScenarioJson = require('./mockData/Scenario'),
    scenarioController = require('../controllers/scenario.server.controller'),
    DocumentCategory = mongoose.model('DocumentCategory'),
    agent = request.agent(app),
    ObjectId = mongoose.Types.ObjectId,
    _ = require('lodash');

/**
 * Globals
 */


var credentials, user,taskObj, scenarioObj, scenarioType, scenarioObject, includeActions, searchTextValueNotExists, searchTextValueExists, searchText, sampleStepIndex, sampleStepJson, sampleStepId, skillsData;

/*
 Scenario Routes Unit Test
 */

describe('Scenarios Routes tests', function () {

    beforeEach(function (done) {
        //DocumentCategory.collection.insert(documentCategories);
        // Create user credentials
        credentials = {
            username: 'username',
            password: 'password'
        };

        skillsData = {
            skills:[
                {
                    _id:mongoose.Types.ObjectId(),
                    label:'test'
                }
            ]
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
        var sampleDocumentCategoryId = '5590ffc8be9b1730042776db';
        sampleStepJson = {
            text: 'Updated Step Text',
            _id: '5590ffc8be9b1730042776db',
            methods: [{
                type: 'Mouse',
                primary: true,
                status : 'default',
                actions: [{
                    text: 'Click dummy text'
                }, {
                    text: 'On the DATABASE TOOLS tab, in the Relationships group, click the Relationships button.'
                }]
            }]
        };
        sampleStepId = '5590ffc8be9b1730042776db';
        // Save a user to the test db and create new scenario object
        user.save(function () {
            Content.findOne({type: 'cms_task'}).exec().then(function (task) {
                taskObj = task.toObject();
                ScenarioJson.taskId = task._id;
                ScenarioJson.friendlyId = taskObj.data.friendlyId + '.T1';
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
    });
    //''

    it('should get metadata of scenario by id with actions included and scenario exists if user is signed in', function (done) {
        //Create a user
        agent.post('/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function (signinErr, signinRes) {
                // Handle signin error
                if (signinErr) done(signinErr);

                //Get Scenario By ID
                agent.get('/scenarios/' + scenarioObj.friendlyId)
                    .expect(200)
                    .end(function (err, res) {
                        if (err) done(err);

                        // Set assertion
                        res.body.should.be.an.Object.with.property('title', scenarioObject.title);
                        should.exist(res.body.steps[0].methods[0].actions);
                        res.body.steps.should.be.an.Array.with.lengthOf(scenarioObject.steps.length);

                        // Call the assertion callback
                        done();

                    });
            });
    });

    it('should get taskId if scenario doesnot exists and user is signed in', function (done) {
        //Create a user
        agent.post('/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function (signinErr, signinRes) {
                // Handle signin error
                if (signinErr) done(signinErr);

                Scenario.find({'friendlyId':scenarioObj.friendlyId}).remove().exec(function () {

                    agent.get('/scenarios/'+scenarioObj.friendlyId)
                        .expect(200)
                        .end(function (err, res) {
                            if (err) done(err);
                            res.body.should.be.an.Object.with.property('taskId');
                            done();
                        });
                });

            });
    });

    it('should get "404" Not found error if scenario friendlyId doesnot exists and user is signed in', function (done) {
        //Create a user
        agent.post('/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function (signinErr, signinRes) {
                // Handle signin error
                if (signinErr) done(signinErr);

                    agent.get('/scenarios/YO.W1.45.90.YT')
                        .expect(404)
                        .end(function (err, res) {
                           done();
                        });
            });
    });

    it('should create a scenario by taskId and friendlyId if user is signed in', function (done) {
        agent.post('/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function (signinErr, signinRes) {
                // Handle signin error
                if (signinErr) done(signinErr);
                var sampleTaskId = taskObj._id.toString();
                var sampleFriendlyId = 'GO13.PPT13.03.01.02.T1';
                agent.post('/scenarios/' + sampleFriendlyId + '?taskId=' + sampleTaskId)
                    .expect(200)
                    .end(function (err, res) {
                        if (err) {
                            done(err);
                        }
                        var createdScenario = res.body;
                        ScenarioTypeEnum.findOne({'code': sampleFriendlyId.slice(sampleFriendlyId.lastIndexOf('.') + 1)}).exec().then(function(scenarioType){
                            var scenarioTypeObj = scenarioType.toObject();
                            var phaseObj =_.find(app.get('phases'), {'code': 'AUT'});
                            var blankScenarioJson = {
                                friendlyId : sampleFriendlyId,
                                taskId : sampleTaskId,
                                title : taskObj.title,
                                type :{
                                    'index':scenarioTypeObj.index,
                                    'code':scenarioTypeObj.code
                                },
                                phase : {
                                    'code':phaseObj.code
                                },
                                createdBy : {
                                    _id: user._id.toString(),
                                    name: user.displayName
                                },
                                updatedBy : {
                                    _id: user._id.toString(),
                                    name: user.displayName
                                }
                            };
                            createdScenario.friendlyId.should.be.equal(blankScenarioJson.friendlyId);
                            createdScenario.taskId.should.be.equal(blankScenarioJson.taskId);
                            createdScenario.title.should.be.equal(blankScenarioJson.title);
                            _.isEqual(createdScenario.type,blankScenarioJson.type).should.be.true;
                            _.isEqual(createdScenario.phase,blankScenarioJson.phase).should.be.true;
                            _.isEqual(createdScenario.createdBy,blankScenarioJson.createdBy).should.be.true;
                            _.isEqual(createdScenario.updatedBy,blankScenarioJson.updatedBy).should.be.true;

                            //isMatch Statement
                            //_.isMatch(createdScenario,blankScenarioJson).should.be.true;
                            done();
                        });
                    });
            });
    });
    it('should get metadata of scenario by id with actions not included if user is signed in', function (done) {

        //Create a user
        agent.post('/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function (signinErr, signinRes) {
                // Handle signin error
                if (signinErr) done(signinErr);

                //Get Scenario By ID with query param
                agent.get('/scenarios/'+scenarioObj.friendlyId)
                    .query({includeActions:false})
                    .expect(200)
                    .end(function (err, res) {
                        if (err) done(err);

                        // Set assertion
                        res.body.should.be.an.Object.with.property('title', scenarioObject.title);
                        should.not.exist(res.body.steps[0].methods[0].actions);
                        res.body.steps.should.be.an.Array.with.lengthOf(scenarioObject.steps.length);

                        // Call the assertion callback
                        done();
                    });

            });
    });


    it('should get step Json of scenario by id and step Index if user is signed in ', function (done) {
        agent.post('/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function (signinErr, signinRes) {
                // Handle signin error
                if (signinErr) done(signinErr);
                agent.get('/scenarios/' + scenarioObj.friendlyId + '/steps/' + sampleStepIndex)
                    .expect(200)
                    .end(function (err, res) {
                        if (err) done(err);

                        var stepJson = res.body;
                        var sampleStepJson = scenarioObject.steps[sampleStepIndex];

                        stepJson.should.be.an.instanceOf(Object);
                        stepJson.text.should.be.equal(sampleStepJson.text);
                        stepJson.methods.should.be.an.Array.with.lengthOf(sampleStepJson.methods.length);
                        stepJson.methods[0].type.should.be.equal(sampleStepJson.methods[0].type);
                        stepJson.methods[0].status.should.be.equal(sampleStepJson.methods[0].status);
                        stepJson.methods[0].primary.should.be.equal(sampleStepJson.methods[0].primary);
                        stepJson.methods[0].actions.should.be.an.Array.with.lengthOf(sampleStepJson.methods[0].actions.length);
                        done();
                    });
            });
    });

    it('should update the step Json by friendly id and step Id if user is signed in', function (done) {
        agent.post('/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function (signinErr, signinRes) {
                // Handle signin error
                if (signinErr) done(signinErr);
                agent.put('/scenarios/' + scenarioObj.friendlyId + '/steps/' + sampleStepId + '?isAutoSave=true')
                    .send(sampleStepJson)
                    .expect(200)
                    .end(function (err, res) {
                        if (err) done(err);
                        Scenario.findOne({'friendlyId': scenarioObj.friendlyId}).exec().then(function (scenario) {
                            var stepJson;
                            stepJson = scenario.steps.id(sampleStepId);
                            stepJson.should.be.an.instanceOf(Object);
                            stepJson.text.should.be.equal(sampleStepJson.text);
                            stepJson.methods.should.be.an.Array.with.lengthOf(sampleStepJson.methods.length);
                            stepJson.methods[0].type.should.be.equal(sampleStepJson.methods[0].type);
                            stepJson.methods[0].status.should.be.equal(sampleStepJson.methods[0].status);
                            stepJson.methods[0].primary.should.be.equal(sampleStepJson.methods[0].primary);
                            stepJson.methods[0].actions.should.be.an.Array.with.lengthOf(sampleStepJson.methods[0].actions.length);
                            done();
                        });
                    });
            });
    });

    it('should delete the step Json by friendlyId and step Id if user is signed in', function (done) {
        agent.post('/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function (signinErr, signinRes) {
                // Handle signin error
                if (signinErr) done(signinErr);
                agent.delete('/scenarios/' + scenarioObj.friendlyId + '/steps/' + sampleStepId)
                    .expect(200)
                    .end(function (err, res) {
                        if (err) done(err);
                        var scenario = res.body;
                        scenario.steps.should.be.an.Array.with.lengthOf(scenarioObj.steps.length - 1);
                        done();
                    });
            });
    });

    it('should get metadata of scenario Object if search text exists', function (done) {
        //Create a user
        agent.post('/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function (signinErr, signinRes) {
                // Handle signin error
                if (signinErr) done(signinErr);

                //Get Scenario By ID with search text
                agent.get('/scenarios/exists')
                    .query({searchText: searchTextValueExists})
                    .expect(200)
                    .end(function (err, res) {
                        res.body.should.be.an.Object.with.property('friendlyId', searchTextValueExists);
                        done();
                    });
            });
    });

    it('should not get metadata of scenario Object if search text does not exists', function (done) {
        //Create a user
        agent.post('/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function (signinErr, signinRes) {
                // Handle signin error
                if (signinErr) done(signinErr);

                //Get Scenario By ID without search text
                agent.get('/scenarios/exists')
                    .query({searchText: searchTextValueNotExists})
                    .expect(200)
                    .end(function (err, res) {
                        should.not.exist(res.body.friendlyId);
                        done();
                    });
            });
    });

    it('should add skills to a step if user is signed in', function (done) {
        //Create a user
        agent.post('/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function (signinErr, signinRes) {
                // Handle signin error
                if (signinErr) done(signinErr);
                //send post call to add skills
                agent.put('/scenarios/' + scenarioObj._id + '/step/' + scenarioObj.steps[0]._id + '/skills')
                    .send(skillsData)
                    .expect(200)
                    .end(function (err, res) {
                        if (err) done(err);

                        // Set assertion
                        res.body.should.be.an.Object.with.property('nModified', 1);
                        res.body.should.be.an.Object.with.property('ok', 1);

                        // Call the assertion callback
                        done();

                    });

            });
    });

    it('should send an error if scenario id is invalid', function (done) {

        //Create a user
        agent.post('/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function (signinErr, signinRes) {
                // Handle signin error
                if (signinErr) done(signinErr);

                //send post call to add skills
                agent.put('/scenarios/' + 'wrongId' + '/step/' + scenarioObj.steps[0]._id + '/skills')
                    .send(skillsData)
                    .expect(400)
                    .end(function (err, res) {
                        done();
                    });
            });
    });
    it('should copy existing source scenario (steps, methods and actions) by friendlyId in the given scenario if user is signed in', function (done) {
        //Create a user
        agent.post('/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function (signinErr, signinRes) {
                // Handle signin error
                if (signinErr) done(signinErr);
                //Dummy Scenario Object
                var originalScenarioObject = new Scenario({
                    'friendlyId' : 'SKL13.XL13.01.01.04.A1',
                    'title' : 'XL Skill 1.04: Construct Multiplication and Division Formulas',
                    'phase' : {
                        'code' : 'DEV'
                    },
                    'type' : {
                        'index' : 1,
                        'code' : 'T1'
                    },
                    'taskId' : '558b9daeff713eb027655066',
                    'steps':[{
                        text : 'old value'
                    }],
                    'createdBy' : {
                        '_id' : '558b9ea2691ea6f41b24de88',
                        'name' : 'Jennifer Hurley'
                    },
                    'updatedBy' : {
                        '_id' : '558b9ea2691ea6f41b24de88',
                        'name' : 'Jennifer Hurley'
                    }

                });

                //Save destination Scenario Object
                originalScenarioObject.save(function (err, data) {
                    if (err) {
                        return err;
                    }
                    var originalScenarioObj = data;

                    //Copy Scenario By Friendly ID
                    agent.put('/scenarios/' + originalScenarioObj.friendlyId + '/source/' + scenarioObj.friendlyId + '/copy')
                        .expect(200)
                        .end(function (err, res) {
                            if (err) done(err);

                            // Set assertion
                            //steps, actions methods should get copied from source: scenarioObj
                            res.body.steps.should.be.an.Array.with.lengthOf(scenarioObj.steps.length);
                            res.body.steps[0].should.be.an.Object.with.property('text', scenarioObj.steps[0].text);
                            res.body.steps[0].methods[0].should.be.an.Object.with.property('type', scenarioObj.steps[0].methods[0].type);
                            res.body.steps[0].methods[0].actions[0].should.be.an.Object.with.property('text', scenarioObj.steps[0].methods[0].actions[0].text);

                            // other info must remain intact
                            res.body.should.be.an.Object.with.property('title', originalScenarioObj.title);
                            //res.body.createdBy.should.be.an.Object.with.property('name', originalScenarioObj.createdBy.name);
                            //res.body.updatedBy.should.be.an.Object.with.property('name', originalScenarioObj.updatedBy.name);

                            // Call the assertion callback
                            done();

                        });
                });

            });
    });

    it('should copy existing source scenario (documents, steps, methods and actions) by friendlyId in the given scenario if user is signed in', function (done) {
        //Create a user
        agent.post('/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function (signinErr, signinRes) {
                // Handle signin error
                if (signinErr) done(signinErr);
                //Dummy Scenario Object
                var originalScenarioObject = new Scenario({
                    'friendlyId' : 'SKL13.XL13.01.01.04.A1',
                    'title' : 'XL Skill 1.04: Construct Multiplication and Division Formulas',
                    'phase' : {
                        'code' : 'DEV'
                    },
                    'type' : {
                        'index' : 1,
                        'code' : 'T1'
                    },
                    'taskId' : '558b9daeff713eb027655066',
                    'steps':[{
                        text : 'old value'
                    }],
                    'createdBy' : {
                        '_id' : '558b9ea2691ea6f41b24de88',
                        'name' : 'Jennifer Hurley'
                    },
                    'updatedBy' : {
                        '_id' : '558b9ea2691ea6f41b24de88',
                        'name' : 'Jennifer Hurley'
                    },
                    "documents": [{
                        'category' : '658b9ea2691ea6f41b24de8c',
                        'file' : ['558b9ea2691ea6f41b24de8a']
                    }]

                });

                //Save destination Scenario Object
                originalScenarioObject.save(function (err, data) {
                    if (err) {
                        return err;
                    }
                    var originalScenarioObj = data;

                    //Copy Scenario By Friendly ID
                    agent.put('/scenarios/' + originalScenarioObj.friendlyId + '/source/' + scenarioObj.friendlyId + '/copy?includeAttachments=true')
                        .expect(200)
                        .end(function (err, res) {
                            if (err) done(err);

                            // Set assertion
                            //steps, actions methods should get copied from source: scenarioObj
                            //res.body.steps.should.be.an.Array.with.lengthOf(scenarioObj.steps.length);
                            //res.body.steps[0].should.be.an.Object.with.property('text', scenarioObj.steps[0].text);
                            //res.body.steps[0].methods[0].should.be.an.Object.with.property('type', scenarioObj.steps[0].methods[0].type);
                            //res.body.steps[0].methods[0].actions[0].should.be.an.Object.with.property('text', scenarioObj.steps[0].methods[0].actions[0].text);

                            // other info must remain intact
                            res.body.should.be.an.Object.with.property('title', originalScenarioObj.title);
                            //res.body.createdBy.should.be.an.Object.with.property('name', originalScenarioObj.createdBy.name);
                            //res.body.updatedBy.should.be.an.Object.with.property('name', originalScenarioObj.updatedBy.name);

                            // Call the assertion callback
                            done();

                        });
                });

            });
    });


    it('should copy non existing source scenario (steps, methods and actions) by friendlyId in the given scenario if user is signed in', function (done) {

        //Create a user
        agent.post('/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function (signinErr, signinRes) {
                // Handle signin error
                if (signinErr) done(signinErr);
                 var sampleFriendlyId = taskObj.data.friendlyId + '.A1'

                Scenario.find({'friendlyId' : sampleFriendlyId}).remove().exec(function () {
                    agent.put('/scenarios/'+sampleFriendlyId+ '/source/'+ scenarioObj.friendlyId + '/copy')
                    .expect(200)
                    .end(function (err, res) {
                        if (err) done(err);
                        res.body.steps.should.be.an.Array.with.lengthOf(scenarioObj.steps.length);
                        res.body.steps[0].should.be.an.Object.with.property('text', scenarioObj.steps[0].text);
                        res.body.steps[0].methods[0].should.be.an.Object.with.property('type', scenarioObj.steps[0].methods[0].type);
                        res.body.steps[0].methods[0].actions[0].should.be.an.Object.with.property('text', scenarioObj.steps[0].methods[0].actions[0].text);

                        // other info must remain intact
                        res.body.should.be.an.Object.with.property('title', taskObj.title);
                        done();
                    });
                });
            });
    });

    it('should get all method Types from the methodtypeEnum Collection if user is signed in ', function (done) {
        agent.post('/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function (signinerr, signinres) {
                if (signinerr) done(signinerr);
                agent.get('/steps/methodTypes')
                    .expect(200)
                    .end(function (err, res) {
                        var methodTypes = res.body;
                        MethodTypeEnum.find({}).exec().then(function (data) {
                            methodTypes.should.be.an.Array.with.lengthOf(data.length);
                            methodTypes[0].name.should.be.equal(data[0].name);
                            done();
                        });
                    });

            });

    });
    it('should create new step for a scenario and return step object with blank methods and actions if the user is signed in', function (done) {
        agent.post('/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function (signinerr, signinres) {
                if (signinerr) done(signinerr);
                agent.post('/scenarios/' + scenarioObj.friendlyId + '/steps')
                    .expect(200)
                    .end(function (err, res) {
                        if (err) done(err);

                        var resStep = res.body;

                        //fetch scenario from database and check if the length of steps has increased by 1.
                        //check if the increased stepId is same as res.body.stepId
                        //check that the methods and actions array has length 0.
                        Scenario.findOne({'friendlyId': scenarioObj.friendlyId}).exec().then(function (scenario) {

                            var step = scenario.steps;
                            step.should.be.an.Array.with.lengthOf(ScenarioJson.steps.length + 1);
                            step[ScenarioJson.steps.length].methods.should.be.an.Array.with.lengthOf(0);
                            done();
                        });
                    });
            });
    });

    it('should import step from source scenario to current selected scenario if the user is signed in', function (done) {
        agent.post('/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function (signinerr, signinres) {
                if (signinerr) done(signinerr);
                //Dummy Scenario Object
                var originalScenarioObject = new Scenario({
                    'friendlyId': 'GO13.WD13.03.3A.01.T1',
                    'title': 'XL Skill 1.04: Construct Multiplication and Division Formulas',
                    'phase': {
                        'code': 'DEV',
                        'index': 3,
                        'launchable': false,
                        'editable': false
                    },
                    'type': {
                        'index': 1,
                        'code': 'T1'
                    },
                    'taskId': '558b9daeff713eb027655066',
                    'steps': [],
                    'createdBy': {
                        '_id': '558b9ea2691ea6f41b24de88',
                        'name': 'Jennifer Hurley'
                    },
                    'updatedBy' : {
                        '_id': '558b9ea2691ea6f41b24de88',
                        'name': 'Jennifer Hurley'
                    }
                });

                //Save destination Scenario Object
                originalScenarioObject.save(function (err, data) {
                    if (err) {
                        return err;
                    }

                    var originalScenarioObj = data;
                    var stepId = '5590ffc8be9b1730042776db';
                    agent.put('/scenarios/' + originalScenarioObj.friendlyId + '/source/' + scenarioObj.friendlyId + '/import/step/' + stepId)
                        .expect(200)
                        .end(function (err, res) {
                            if (err) {
                                console.info('err : ', err);
                                done(err);
                            }
                            Scenario.findOne({'friendlyId': originalScenarioObj.friendlyId}).exec().then(function (scenario) {
                                var step = scenario.steps;
                                step.should.be.an.Array.with.lengthOf(1);
                                done();
                            }).then(null, function (err) {
                                done(err);
                            });
                        });
                });
            });
    });

    it('should get metadata of scenario by id with taskdata included if user is signed in', function (done) {

        //Create a user
        agent.post('/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function (signinErr, signinRes) {
                // Handle signin error
                if (signinErr) done(signinErr);

                //Get Scenario By ID with query param
                agent.get('/scenarios/' + scenarioObj.friendlyId)
                    .query({includeActions: false, getTaskData: true})
                    .expect(200)
                    .end(function (err, res) {
                        if (err) done(err);

                        // Set assertion
                        res.body.should.be.an.Object.with.property('title', scenarioObject.title);
                        should.not.exist(res.body.steps[0].methods[0].actions);
                        res.body.steps.should.be.an.Array.with.lengthOf(scenarioObject.steps.length);
                        res.body.taskId.should.be.an.Object.with.property('app');

                        // Call the assertion callback
                        done();
                    });

            });
    });


    describe('Scenario Siblings Test and Get Scenarios By TaskId', function () {
        beforeEach(function (done) {
            // create siblings, one without steps, other with steps
            var siblingScenarioObj1, siblingScenarioObj2;
            var siblingScenarioObject1 = new Scenario(ScenarioJson);
            siblingScenarioObject1.friendlyId = 'YO13.XL13.01.01.08.A1';
            siblingScenarioObject1.phase.code = 'DEV';
            siblingScenarioObject1.steps = [];

            //Save destination Scenario Object
            siblingScenarioObject1.save(function (err, data) {
                if (err) {
                    return err;
                }
                siblingScenarioObj1 = data;
            });

            var siblingScenarioObject2 = new Scenario(ScenarioJson);
            siblingScenarioObject2.friendlyId = 'YO13.XL13.01.01.08.T1';

            //Save destination Scenario Object
            siblingScenarioObject2.save(function (err, data) {
                if (err) {
                    return err;
                }
                siblingScenarioObj2 = data;
                done();
            });
        });

        it('should get scenario siblings having steps by friendlyId  if user is signed in', function (done) {
            //Create a user
            agent.post('/auth/signin')
                .send(credentials)
                .expect(200)
                .end(function (signinErr, signinRes) {
                    // Handle signin error
                    if (signinErr) done(signinErr);
                    //call get Siblings API
                    agent.get('/scenarios/' + scenarioObj.friendlyId + '/siblings')
                        .query({hasSteps: true, isEditable: false})
                        .expect(200)
                        .end(function (err, res) {
                            if (err) done(err);
                            res.body.should.be.an.Array.with.lengthOf(2);
                            //res.body.should.containEql({friendlyId:siblingScenarioObj2.friendlyId});
                            //res.body.should.containEql({friendlyId:ScenarioJson.friendlyId});
                            done();

                        });
                });
        });

        it('should get scenario siblings by friendlyId, having steps and isEditable true if user is signed in', function (done) {
            //Create a user
            agent.post('/auth/signin')
                .send(credentials)
                .expect(200)
                .end(function (signinErr, signinRes) {
                    // Handle signin error
                    if (signinErr) done(signinErr);
                    //call get Siblings API
                    agent.get('/scenarios/' + scenarioObj.friendlyId + '/siblings')
                        .query({hasSteps: true,isEditable: true})
                        .expect(200)
                        .end(function (err, res) {
                            if (err) done(err);

                            res.body.should.be.an.Array.with.lengthOf(2);
                            //res.body.should.containEql({friendlyId:siblingScenarioObj2.friendlyId});
                            //res.body.should.containEql({friendlyId:ScenarioJson.friendlyId});
                            done();

                        });
                });
        });

        it('should get scenario siblings by friendlyId if user is signed in', function (done) {
            //Create a user
            agent.post('/auth/signin')
                .send(credentials)
                .expect(200)
                .end(function (signinErr, signinRes) {
                    // Handle signin error
                    if (signinErr) done(signinErr);
                    //call get Siblings API
                    agent.get('/scenarios/' + scenarioObj.friendlyId + '/siblings')
                        .query({hasSteps: false})
                        .expect(200)
                        .end(function (err, res) {
                            if (err) done(err);
                            res.body.should.be.an.Array.with.lengthOf(3);
                            //res.body.should.containEql({friendlyId:siblingScenarioObj2.friendlyId});
                            //res.body.should.containEql({friendlyId:siblingScenarioObj1.friendlyId});
                            //res.body.should.containEql({friendlyId:ScenarioJson.friendlyId});
                            done();

                        });
                });
        });
        //Get Scenarios By Task ID
        it('should get Scenarios having steps by TaskID is user is signed in', function (done) {
            agent.post('/auth/signin')
                .send(credentials)
                .expect(200)
                .end(function (signinerr, signinres) {
                    if (signinerr) done(signinerr);
                    var taskId = scenarioObj.taskId;
                    agent.get('/task/' + taskId + '/scenarios')
                        .query({hasSteps: true})
                        .expect(200)
                        .end(function (err, res) {
                            if (err)done(err);
                            res.body.should.be.an.Array.with.lengthOf(2);
                            done();
                        });
                });
        });
        it('should get Scenarios having steps by TaskID is user is signed in', function (done) {
            agent.post('/auth/signin')
                .send(credentials)
                .expect(200)
                .end(function (signinerr, signinres) {
                    if (signinerr) done(signinerr);
                    var taskId = scenarioObj.taskId;
                    agent.get('/task/' + taskId + '/scenarios')
                        .query({hasSteps: false})
                        .expect(200)
                        .end(function (err, res) {
                            if (err)done(err);
                            res.body.should.be.an.Array.with.lengthOf(3);
                            done();
                        });
                });
        });
    });

    it('should call next handler if Scenario Phase is editable',function(done){
        //Create a user
        agent.post('/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function (signinErr, signinRes) {
                // Handle signin error
                if (signinErr) done(signinErr);
                var test;
                var req = httpMocks.createRequest(),
                    res = httpMocks.createResponse(),
                    testValue = 'dummy object',
                    next = function(){
                        test = testValue;
                    };
                //Set Request Object
                req.app = app;
                req.scenario = {
                  phase : {
                      code : _.find(req.app.get('phases'), {'editable': true}).code
                  }
                };
                scenarioController.isScenarioPhaseEditable(req,res,next);
                test.should.equal(testValue);
                done();
            });
    });

    it('should get 403 forbidden if Scenario Phase is not editable',function(done){
        //Create a user
        agent.post('/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function (signinErr, signinRes) {
                // Handle signin error
                if (signinErr) done(signinErr);
                var test;
                var req = httpMocks.createRequest(),
                    res = httpMocks.createResponse(),
                    next = function(){
                        test = 'dummy object';
                    };
                //Set Request Object
                req.app = app;
                req.scenario = {
                    phase : {
                        code : _.find(req.app.get('phases'), {'editable': false}).code
                    }
                };
                scenarioController.isScenarioPhaseEditable(req,res,next);
                res.statusCode.should.equal(403);
                done();
            });
    });

    it('should not change phase of scenario if user is signed in but not authorized', function (done) {

        //Create a user
        agent.post('/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function (signinErr, signinRes) {
                // Handle signin error
                if (signinErr) done(signinErr);
                //Get Scenario By ID with query param

                scenarioPhaseEnum.find({}).exec().then(function (data) {
                    var phase = [];
                    _.forEach(data, function (item) {
                        if (!(_.intersection(item.usersRoles, user.roles).length))
                            phase.push(item);
                    });
                    scenarioObject.phase.code = phase[0].code;

                    //Save Scenario Object with current phase
                    scenarioObject.save(function (err, data) {
                        if (err) {
                            done(err);
                        }
                        scenarioObj = data;
                        DocumentCategory.find({}).exec().then(function (data) {

                            agent.put('/scenarios/' + scenarioObj.friendlyId + '/phase/' + phase[0].code + '/transition')
                                .expect(403)
                                .end(function (err, res) {
                                    if (err)done(err);
                                    done();
                                });
                        });

                    });
                });

            });
    });

    it('should change phase of scenario if user is signed in and authorized but validation failed', function (done) {

        //Create a user
        agent.post('/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function (signinErr, signinRes) {
                // Handle signin error
                if (signinErr) done(signinErr);

                scenarioPhaseEnum.find({}).exec().then(function (data) {
                    var sampleErrorStep1 = {
                     text : '',
                     methods : [{
                         type : 'Ribbon',
                         primary : true,
                         status : 'default',
                         actions : [{
                         text : ''
                         }]
                     }],
                     skills:[]
                     };
                     var sampleErrorStep2 = {
                     text : '',
                     methods : [],
                     skills:[]
                     };
                    var currentPhase =  _.find(data, {'usersRoles' : user.roles});
                    var phase = data[0];
                    // scenarioObj.phase = phase;


                    scenarioObject.phase.code = currentPhase.code;
                    scenarioObject.steps.push(sampleErrorStep1, sampleErrorStep2);

                    //Save Scenario Object with current phase
                    scenarioObject.save(function (err, data) {
                        if (err) {
                            done(err);
                        }
                        scenarioObj = data;

                        agent.put('/scenarios/' + scenarioObj.friendlyId + '/phase/' + phase.code + '/transition')
                            .expect(200)
                            .end(function (err, res) {
                                if (err) done(err);
                                var error = res.body;

                                error.should.be.an.Object.with.property('steps');
                                error.steps.should.be.an.Object.with.properties('3', '4');
                                error.steps['3'].should.be.an.Object.with.properties('blankStep', 'blankAction');
                                error.steps['3'].blankAction.should.be.an.Array.with.length(1);
                                error.steps['4'].should.be.an.Object.with.properties('blankStep', 'noMethod');
                                Scenario.findOne({'friendlyId': scenarioObj.friendlyId}).exec().then(function (scenario) {
                                 scenario.phase.should.be.an.Object.with.property('code', currentPhase.code);
                                 done();
                                 });
                            });
                    });

                });

            });
    });


    it('should change phase of scenario if user is signed in, authorized and validated', function (done) {

        //Create a user
        agent.post('/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function (signinErr, signinRes) {
                // Handle signin error
                if (signinErr) done(signinErr);
                //Get Scenario By ID with query param
                scenarioPhaseEnum.find({}).exec().then(function (data) {
                    var currentPhase =  _.find(data, {'usersRoles' : user.roles});
                    var phase = data[0];
                    // scenarioObj.phase = phase;
                    scenarioObject.phase.code = currentPhase.code;
                    scenarioObject.steps = scenarioObject.steps.slice(0,1);
                    //Save Scenario Object with current phase
                    scenarioObject.save(function (err, data) {
                        if (err) {
                            done(err);
                        }
                        scenarioObj = data;

                        agent.put('/scenarios/' + scenarioObj.friendlyId + '/phase/' + phase.code + '/transition')
                            .expect(200)
                            .end(function (err, res) {
                                if (err) done(err);
                                res.body.should.be.true;

                                Scenario.findOne({'friendlyId': scenarioObj.friendlyId}).exec().then(function (scenario) {
                                    scenario.phase.should.be.an.Object.with.property('code', phase.code);
                                    done();
                                });
                            });
                    });
                });

            });
    });


    it('should get all methods by stepId if user is signed in ',function(done){
        agent.post('/auth/signin')
            .send(credentials)
            .expect(200)
            .end(function(signinerr,signinres){
                if (signinerr) done(signinerr);
                agent.get('/scenarios/'+scenarioObj.friendlyId+'/steps/id/'+sampleStepId)
                    .expect(200)
                    .end(function (err, res) {
                        if (err) done(err);

                        var stepJson = res.body.step;
                        var sampleStepJson = _.find(scenarioObject.steps,{_id:ObjectId(sampleStepId)});
                        stepJson.should.be.an.instanceOf(Object);
                        stepJson.text.should.be.equal(sampleStepJson.text);
                        stepJson.methods.should.be.an.Array.with.lengthOf(sampleStepJson.methods.length);
                        stepJson.methods[0].type.should.be.equal(sampleStepJson.methods[0].type);
                        stepJson.methods[0].status.should.be.equal(sampleStepJson.methods[0].status);
                        stepJson.methods[0].primary.should.be.equal(sampleStepJson.methods[0].primary);
                        stepJson.methods[0].actions.should.be.an.Array.with.lengthOf(sampleStepJson.methods[0].actions.length);
                        done();
                    });

            });

    });

    afterEach(function(done) {
        Scenario.remove().exec(function() {
            User.remove().exec(done);
        });
    });

})
;
