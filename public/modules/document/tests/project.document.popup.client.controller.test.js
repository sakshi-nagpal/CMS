'use strict';

define(['documentModule', 'angularMocks'], function () {

    var controller, scope, stateParams, $httpBackend, close;

    describe('ProjectDocumentController', function () {

        var series = {
            "_id": "55f29a0a39d1e3bd0a597563",
            "path": "55f29a0a39d1e3bd0a597563",
            "parent": null,
            "title": "Exploring with Microsoft Office 2013",
            "type": "cms_series",
            "__v": 0,
            "_t": "Series",
            "data": {
                "icon": "Office13_2",
                "documentCategories": [{
                    "type": "scenario",
                    "categories": [{
                        "_id": "558a614d8963451025d9428a",
                        "code": "START_DOC",
                        "displayName": "Start Doc",
                        "allowedAmount": "1",
                        "notifications": true,
                        "order": 1,
                        "fileSize": 20971520,
                        "required": true,
                        "__v": 0,
                        "capability": "edit_file",
                        "allowedPhases": ["AUT"]
                    },
                        {
                            "_id": "558a614d8963451025d9428b",
                            "code": "END_DOC",
                            "displayName": "End Doc",
                            "allowedAmount": "1",
                            "notifications": true,
                            "order": 2,
                            "fileSize": 20971520,
                            "required": true,
                            "capability": "edit_file",
                            "__v": 0,
                            "allowedPhases": ["AUT"]
                        },
                        {
                            "_id": "558a614d8963451025d9428c",
                            "code": "DEV_DOC",
                            "displayName": "Dev Doc",
                            "allowedAmount": "1",
                            "notifications": false,
                            "order": 4,
                            "fileSize": 20971520,
                            "required": false,
                            "capability": "edit_file",
                            "__v": 0,
                            "allowedPhases": ["AUT"]
                        },
                        {
                            "_id": "559d0c3e8e46f985d8f9e84d",
                            "code": "AUDIO_FILE",
                            "displayName": "Audio File",
                            "allowedAmount": "1",
                            "notifications": true,
                            "order": 3,
                            "fileSize": 20971520,
                            "required": false,
                            "capability": "edit_audio_file",
                            "__v": 0,
                            "allowedPhases": ["AUT",
                                "CQA",
                                "ERV",
                                "DEV"]
                        },
                        {
                            "_id": "559f579c8e46f988c0eec44c",
                            "code": "AUDIO_TIMING_FILE",
                            "displayName": "Audio Timing File",
                            "allowedAmount": "1",
                            "notifications": true,
                            "order": 5,
                            "fileSize": 20971520,
                            "required": false,
                            "capability": "edit_audio_file",
                            "__v": 0,
                            "allowedPhases": ["AUT"]
                        },
                        {
                            "_id": "559f58018e46f988c0eec44d",
                            "code": "Additional_Assets",
                            "displayName": "Additional Assets File",
                            "allowedAmount": "*",
                            "notifications": false,
                            "order": 6,
                            "fileSize": 20971520,
                            "required": false,
                            "capability": "edit_file",
                            "__v": 0,
                            "allowedPhases": ["AUT"]
                        },
                        {
                            "_id": "5614f0f903c8372ab7f3053e",
                            "code": "AUDIO_TIMING_XML",
                            "displayName": "Audio Timing XML",
                            "allowedAmount": "1",
                            "notifications": true,
                            "order": 7,
                            "fileSize": 20971520,
                            "required": false,
                            "capability": "edit_file",
                            "__v": 0,
                            "downloadOnly": true,
                            "allowedPhases": ["AUT"]
                        }]
                },
                    {
                        "type": "cms_project",
                        "categories": [{
                            "_id": "558a614d8963451025d9428a",
                            "code": "START_DOC",
                            "displayName": "Start Doc",
                            "allowedAmount": "1",
                            "notifications": true,
                            "order": 1,
                            "fileSize": 20971520,
                            "required": true,
                            "__v": 0,
                            "capability": "edit_file",
                            "allowedPhases": ["AUT"]
                        },
                            {
                                "_id": "558a614d8963451025d9428b",
                                "code": "END_DOC",
                                "displayName": "End Doc",
                                "allowedAmount": "1",
                                "notifications": true,
                                "order": 2,
                                "fileSize": 20971520,
                                "required": true,
                                "capability": "edit_file",
                                "__v": 0,
                                "allowedPhases": ["AUT"]
                            },
                            {
                                "_id": "56051d00d47e31f2fc17254c",
                                "code": "PROJECT_BMP",
                                "displayName": "Project BMP",
                                "allowedAmount": "1",
                                "notifications": false,
                                "order": 3,
                                "fileSize": 20971520,
                                "required": false,
                                "capability": "edit_file",
                                "__v": 0,
                                "allowedPhases": ["AUT"]
                            },
                            {
                                "_id": "558a614d8963451025d9428c",
                                "code": "DEV_DOC",
                                "displayName": "Dev Doc",
                                "allowedAmount": "1",
                                "notifications": false,
                                "order": 4,
                                "fileSize": 20971520,
                                "required": false,
                                "capability": "edit_file",
                                "__v": 0,
                                "allowedPhases": ["AUT"]
                            }]
                    }],
                "scenarioTypes": [{
                    "index": 1,
                    "code": "T1"
                },
                    {
                        "index": 2,
                        "code": "A1"
                    },
                    {
                        "index": 3,
                        "code": "A2"
                    }],
                "taxonomy": [{
                    "name": "Series",
                    "view": "0",
                    "index": "1",
                    "type": "cms_series"
                },
                    {
                        "name": "Volume",
                        "view": "1",
                        "index": "2",
                        "type": "cms_section"
                    },
                    {
                        "name": "Chapter",
                        "view": "1",
                        "index": "3",
                        "type": "cms_chapter"
                    },
                    {
                        "name": "Project",
                        "view": "2",
                        "index": "4",
                        "type": "cms_project"
                    },
                    {
                        "name": "Task",
                        "view": "2",
                        "index": "5",
                        "type": "cms_task"
                    }]
            },
            "documentVersion": 2,
            "updatedTimestamp": "2015-09-11T09:08:26.851Z",
            "createdTimestamp": "2015-09-11T09:08:26.041Z"
        };

        var project = {
            "_id": "55f29a0c39d1e3bd0a597664",
            "path": "55f29a0a39d1e3bd0a597563#55f29a0a39d1e3bd0a597570#55f29a0a39d1e3bd0a59758e#55f29a0c39d1e3bd0a597664",
            "parent": "55f29a0a39d1e3bd0a59758e",
            "title": "Hands on Exercise 1 - Windows 8 Startup",
            "type": "cms_project",
            "__v": 6,
            "app": "",
            "serialNumber": 2,
            "documentVersion": 9,
            "updatedTimestamp": "2015-10-19T05:51:35.01Z",
            "createdTimestamp": "2015-09-11T09:08:28.566Z",
            "data": {
                "content_ref": [],
                "documents": [{
                    "documents": [{
                        "category": "56051d00d47e31f2fc17254c",
                        "files": "562484e63ea36b942906363f"
                    }],
                    "scenarioType": {
                        "index": 1,
                        "code": "T1"
                    }
                }, {
                    "documents": [{
                        "category": "56051d00d47e31f2fc17254c",
                        "files": ["562484e63ea36b9429063640"]
                    }],
                    "scenarioType": {
                        "index": 2,
                        "code": "A1"
                    }
                }, {
                    "documents": [{
                        "category": "56051d00d47e31f2fc17254c",
                        "files": ["562484e73ea36b9429063641"]
                    }],
                    "scenarioType": {
                        "index": 3,
                        "code": "A2"
                    }
                }]
            }
        };

        var completeProject = {
            "_id": "55f29a0c39d1e3bd0a597664",
            "path": "55f29a0a39d1e3bd0a597563#55f29a0a39d1e3bd0a597570#55f29a0a39d1e3bd0a59758e#55f29a0c39d1e3bd0a597664",
            "parent": "55f29a0a39d1e3bd0a59758e",
            "title": "Hands on Exercise 1 - Windows 8 Startup",
            "type": "cms_project",
            "__v": 6,
            "app": "",
            "serialNumber": 2,
            "data": {
                "documents": [{
                    "documents": [{
                        "category": {
                            "_id": "56051d00d47e31f2fc17254c",
                            "code": "PROJECT_BMP",
                            "displayName": "Project BMP",
                            "allowedAmount": "1",
                            "notifications": false,
                            "order": 3,
                            "fileSize": 20971520,
                            "required": false,
                            "capability": "edit_file",
                            "__v": 0,
                            "allowedPhases": ["AUT"]
                        },
                        "files": [{
                            "_id": "562484e63ea36b942906363f",
                            "__t": "files",
                            "originalName": "EXP13_OF13_01_01_T1_PROJECT_BMP.jpg",
                            "fileType": "image/jpeg",
                            "fileSize": 106616,
                            "timeStamp": "2015-10-19T05:51:34.955Z",
                            "tmpName": "EXP13_OF13_01_01_T1_PROJECT_BMP_1445233894955.jpg",
                            "location": "55f29a0a39d1e3bd0a597563/55f29a0c39d1e3bd0a597664/T1",
                            "__v": 0,
                            "documentVersion": 1,
                            "updatedTimestamp": "2015-10-19T05:51:34.962Z",
                            "createdTimestamp": "2015-10-19T05:51:34.961Z"
                        }]
                    }],
                    "scenarioType": {
                        "index": 1,
                        "code": "T1"
                    }
                },
                    {
                        "documents": [{
                            "category": {
                                "_id": "56051d00d47e31f2fc17254c",
                                "code": "PROJECT_BMP",
                                "displayName": "Project BMP",
                                "allowedAmount": "1",
                                "notifications": false,
                                "order": 3,
                                "fileSize": 20971520,
                                "required": false,
                                "capability": "edit_file",
                                "__v": 0,
                                "allowedPhases": ["AUT"]
                            },
                            "files": [{
                                "_id": "562484e63ea36b9429063640",
                                "__t": "files",
                                "originalName": "EXP13_OF13_01_01_A1_PROJECT_BMP.jpg",
                                "fileType": "image/jpeg",
                                "fileSize": 120040,
                                "timeStamp": "2015-10-19T05:51:34.983Z",
                                "tmpName": "EXP13_OF13_01_01_A1_PROJECT_BMP_1445233894983.jpg",
                                "location": "55f29a0a39d1e3bd0a597563/55f29a0c39d1e3bd0a597664/A1",
                                "__v": 0,
                                "documentVersion": 1,
                                "updatedTimestamp": "2015-10-19T05:51:34.986Z",
                                "createdTimestamp": "2015-10-19T05:51:34.986Z"
                            }]
                        }],
                        "scenarioType": {
                            "index": 2,
                            "code": "A1"
                        }
                    },
                    {
                        "documents": [{
                            "category": {
                                "_id": "56051d00d47e31f2fc17254c",
                                "code": "PROJECT_BMP",
                                "displayName": "Project BMP",
                                "allowedAmount": "1",
                                "notifications": false,
                                "order": 3,
                                "fileSize": 20971520,
                                "required": false,
                                "capability": "edit_file",
                                "__v": 0,
                                "allowedPhases": ["AUT"]
                            },
                            "files": [{
                                "_id": "562484e73ea36b9429063641",
                                "__t": "files",
                                "originalName": "EXP13_OF13_01_01_A2_PROJECT_BMP.jpg",
                                "fileType": "image/jpeg",
                                "fileSize": 106616,
                                "timeStamp": "2015-10-19T05:51:35.003Z",
                                "tmpName": "EXP13_OF13_01_01_A2_PROJECT_BMP_1445233895003.jpg",
                                "location": "55f29a0a39d1e3bd0a597563/55f29a0c39d1e3bd0a597664/A2",
                                "__v": 0,
                                "documentVersion": 1,
                                "updatedTimestamp": "2015-10-19T05:51:35.005Z",
                                "createdTimestamp": "2015-10-19T05:51:35.005Z"
                            }]
                        }],
                        "scenarioType": {
                            "index": 3,
                            "code": "A2"
                        }
                    }],
                "content_ref": []
            },
            "documentVersion": 9,
            "updatedTimestamp": "2015-10-19T05:51:35.010Z",
            "createdTimestamp": "2015-09-11T09:08:28.566Z"
        };

        var scenarioTypes = [{
            "code": "T1",
            "index": 1
        }, {
            "code": "A1",
            "index": 2
        }, {
            "code": "A2",
            "index": 3
        }];

        var fileItems = [
            {
                category: {
                    "_id": "558a614d8963451025d9428a",
                    "code": "START_DOC",
                    "displayName": "Start Doc",
                    "allowedAmount": "1",
                    "notifications": true,
                    "order": 1,
                    "fileSize": 20971520,
                    "required": true,
                    "__v": 0,
                    "capability": "edit_file",
                    "allowedPhases": ["AUT"]
                },
                items: [{
                    scenarioType: {code: "T1", index: 1},
                    files: []
                }, {
                    scenarioType: {code: "A1", index: 2},
                    files: []
                }, {
                    scenarioType: {code: "A2", index: 3},
                    files: []
                }],
                select: false,
                enable: false
            },
            {
                category: {
                    "_id": "558a614d8963451025d9428b",
                    "code": "END_DOC",
                    "displayName": "End Doc",
                    "allowedAmount": "1",
                    "notifications": true,
                    "order": 2,
                    "fileSize": 20971520,
                    "required": true,
                    "capability": "edit_file",
                    "__v": 0,
                    "allowedPhases": ["AUT"]
                },
                items: [{
                    scenarioType: {code: "T1", index: 1},
                    files: []
                }, {
                    scenarioType: {code: "A1", index: 2},
                    files: []
                }, {
                    scenarioType: {code: "A2", index: 3},
                    files: []
                }],
                select: false,
                enable: false
            },
            {
                category: {
                    "_id": "56051d00d47e31f2fc17254c",
                    "code": "PROJECT_BMP",
                    "displayName": "Project BMP",
                    "allowedAmount": "1",
                    "notifications": false,
                    "order": 3,
                    "fileSize": 20971520,
                    "required": false,
                    "capability": "edit_file",
                    "__v": 0,
                    "allowedPhases": ["AUT"]
                },
                items: [{
                    scenarioType: {code: "T1", index: 1},
                    files: [{
                        "_id": "562484e63ea36b942906363f",
                        "__t": "files",
                        "originalName": "EXP13_OF13_01_01_T1_PROJECT_BMP.jpg",
                        "fileType": "image/jpeg",
                        "fileSize": 106616,
                        "timeStamp": "2015-10-19T05:51:34.955Z",
                        "tmpName": "EXP13_OF13_01_01_T1_PROJECT_BMP_1445233894955.jpg",
                        "location": "55f29a0a39d1e3bd0a597563/55f29a0c39d1e3bd0a597664/T1",
                        "__v": 0,
                        "documentVersion": 1,
                        "updatedTimestamp": "2015-10-19T05:51:34.962Z",
                        "createdTimestamp": "2015-10-19T05:51:34.961Z"
                    }]
                }, {
                    scenarioType: {code: "A1", index: 2},
                    files: [{
                        "_id": "562484e63ea36b9429063640",
                        "__t": "files",
                        "originalName": "EXP13_OF13_01_01_A1_PROJECT_BMP.jpg",
                        "fileType": "image/jpeg",
                        "fileSize": 120040,
                        "timeStamp": "2015-10-19T05:51:34.983Z",
                        "tmpName": "EXP13_OF13_01_01_A1_PROJECT_BMP_1445233894983.jpg",
                        "location": "55f29a0a39d1e3bd0a597563/55f29a0c39d1e3bd0a597664/A1",
                        "__v": 0,
                        "documentVersion": 1,
                        "updatedTimestamp": "2015-10-19T05:51:34.986Z",
                        "createdTimestamp": "2015-10-19T05:51:34.986Z"
                    }]
                }, {
                    scenarioType: {code: "A2", index: 3},
                    files: [{
                        "_id": "562484e73ea36b9429063641",
                        "__t": "files",
                        "originalName": "EXP13_OF13_01_01_A2_PROJECT_BMP.jpg",
                        "fileType": "image/jpeg",
                        "fileSize": 106616,
                        "timeStamp": "2015-10-19T05:51:35.003Z",
                        "tmpName": "EXP13_OF13_01_01_A2_PROJECT_BMP_1445233895003.jpg",
                        "location": "55f29a0a39d1e3bd0a597563/55f29a0c39d1e3bd0a597664/A2",
                        "__v": 0,
                        "documentVersion": 1,
                        "updatedTimestamp": "2015-10-19T05:51:35.005Z",
                        "createdTimestamp": "2015-10-19T05:51:35.005Z"
                    }]
                }],
                select: false,
                enable: true
            },
            {
                category: {
                    "_id": "558a614d8963451025d9428c",
                    "code": "DEV_DOC",
                    "displayName": "Dev Doc",
                    "allowedAmount": "1",
                    "notifications": false,
                    "order": 4,
                    "fileSize": 20971520,
                    "required": false,
                    "capability": "edit_file",
                    "__v": 0,
                    "allowedPhases": ["AUT"]
                },
                items: [{
                    scenarioType: {code: "T1", index: 1},
                    files: []
                }, {
                    scenarioType: {code: "A1", index: 2},
                    files: []
                }, {
                    scenarioType: {code: "A2", index: 3},
                    files: []
                }],
                select: false,
                enable: false
            }
        ]

        beforeEach(module(ApplicationConfiguration.applicationModuleName, function ($translateProvider) {
            $translateProvider.translations('en', {});
        }));

        beforeEach(inject(function (_$controller_, _$httpBackend_, _$rootScope_) {
                scope = _$rootScope_.$new();
                var $controller = _$controller_;
                $httpBackend = _$httpBackend_;
                stateParams = {taskId: '5549e405e20c0104052ad199'};
                $httpBackend.when('GET', '/element/' + project._id + '/series').respond(series);
                $httpBackend.when('GET', '/project/' + project._id).respond(completeProject);
                controller = $controller('ProjectDocumentController', {
                    $scope: scope,
                    project: project,
                    scenarioTypes: scenarioTypes,
                    $modalInstance: function () {
                    }
                });
            })
        );

        it('get the missing documents', function () {
            $httpBackend.flush();
            expect(scope.fileItems).toEqual(fileItems);
        });

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });

    });
});
