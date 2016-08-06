'use strict';

define(['documentModule', 'angularMocks'], function () {

    describe('CommentsController', function () {

        var controller, $scope, stateParams, $httpBackend, CommentsController, scope, $stateParams, $location;
        var scenarioId, stepId;
        var sampleScenario = {
            "_id": "5593c8b6cbc2c8841dd6c038",
            "__t": "Scenario",
            "friendlyId": "WIN10.W10.01.01.11.T1",
            "eTextURL": "",
            "videoURL": "",
            "title": "W10 Question 11: Adjusting Account Settings",
            "pageNo": "",
            "taskId": "5593c6cf68f5ba600b5f8f39",
            "steps": [{
                "text": "Display the home page of the Settings window.",
                "_id": "55efea589ba3a6440682f3ac",
                "threads": [],
                "skills": [],
                "methods": []
            }, {
                "text": "In the Settings window, change the Accounts setting to create a PIN to use in place of a password. Set <SPAN style=\"COLOR: rgb(0,0,255)\"><B>2016 </B></SPAN>as the PIN.<BR><B><FONT color=#ff0000>DEV NOTE: Note to COMPRO--I added an item to allow the students to open the Settings window, in which case there&nbsp;are now&nbsp;two items here; when Accounts is selected, the Your Account screen displays; please use the “generic” myitlab user name here, with Administrator shown below it.</FONT></B>",
                "_id": "55efea589ba3a6440682f380",
                "threads": [],
                "skills": [],
                "methods": []
            }],
            "threads": []
        };

        var sampleStepThread = [{
            "sequence": 0,
            "thread": {
                "_id": "55f14d945d7495082bed60e4",
                "__t": "threads",
                "__v": 0,
                "comments": [{
                    "sequence": 0,
                    "_id": "55f14d945d7495082bed60e5",
                    "comment": {
                        "text": "Hello",
                        "user": {
                            "_id": "55013a131d6d4664181832e1",
                            "displayName": "Baloo Compro"
                        },
                        "timeStamp": "2015-09-10T09:29:56.379Z"
                    }
                }],
                "documentVersion": 1,
                "updatedTimestamp": "2015-09-10T09:29:56.381Z",
                "createdTimestamp": "2015-09-10T09:29:56.379Z"
            },
            "_id": "55f14d945d7495082bed60e6"
        }];

        beforeEach(function () {
            jasmine.addMatchers({
                toEqualData: function (util, customEqualityTesters) {
                    return {
                        compare: function (actual, expected) {
                            return {
                                pass: angular.equals(actual, expected)
                            };
                        }
                    };
                }
            });
        });

        beforeEach(module(ApplicationConfiguration.applicationModuleName, function ($translateProvider) {
            $translateProvider.translations('en', {});
        }));

        beforeEach(function () {
            scenarioId = sampleScenario._id;
            stepId = sampleScenario.steps[0]._id;
        });

        beforeEach(inject(function (_$controller_, _$httpBackend_, _$rootScope_) {
            $scope = _$rootScope_.$new();
            $scope.scenarioId = scenarioId;
            $scope.stepId = stepId;
            var $controller = _$controller_;
            $httpBackend = _$httpBackend_;
            //$httpBackend.expectGET('/threads/count/scenario/' + scenarioId + '/step/' + stepId).respond(sampleStepThread);
            $httpBackend.expectGET('/threads/scenario/' + scenarioId + '/step/' + stepId).respond([]);
            controller = $controller('CommentsController', {
                $scope: $scope,
                title:"StepComments",
                stepIndex:0,
                scenarioId:scenarioId,
                stepId:stepId,
                stepNewCommentCountArray:'',
                $modalInstance:'',
                Authentication: {user: "test"}

            });
        }));

    /*    it('Should add new thread', inject(function () {
            $httpBackend.expectPOST('/threads/scenario/' + scenarioId + '/step/' + stepId).respond({});
            //$httpBackend.expectGET('/threads/count/scenario/' + scenarioId + '/step/' + stepId).respond(sampleStepThread);
            $httpBackend.expectGET('/threads/scenario/' + scenarioId + '/step/' + stepId).respond(sampleStepThread);
            $scope.newComment = "Hello";
            $scope.postComment();

            $httpBackend.flush();
        }));*/

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });
    });
});
