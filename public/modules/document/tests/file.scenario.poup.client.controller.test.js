'use strict';

define(['documentModule', 'angularMocks'], function () {

    describe('ScenarioDocumentController', function () {
        var controller, $scope, stateParams, $httpBackend, itemCount, ConfirmPopupService;

        var addedDate = new Date();

        var sampleSeries = {
            _id: '55840ba7e19e231c258dd4a9',
            path: '55840ba7e19e231c258dd4a9',
            parent: null,
            title: 'Exploring with Microsoft Office 2013',
            type: 'cms_series',
            documentVersion: 2,
            updatedTimestamp: new Date('2015-06-19T12:31:35.129Z'),
            createdTimestamp: new Date('2015-06-19T12:31:35.095Z'),
            __v: 0,
            _t: 'Series',
            data: {
                taxonomy: [{
                    name: 'Series',
                    view: '0',
                    index: '1',
                    type: 'cms_series'
                }, {
                    name: 'Volume',
                    view: '1',
                    index: '2',
                    type: 'cms_section'
                }, {
                    name: 'Chapter',
                    view: '1',
                    index: '3',
                    type: 'cms_chapter'
                }, {
                    name: 'Project',
                    view: '2',
                    index: '4',
                    type: 'cms_project'
                }, {
                    name: 'Task',
                    view: '2',
                    index: '5',
                    type: 'cms_task'
                }],
                scenarioTypes: [{
                    index: 1,
                    code: 'T1'
                }, {
                    index: 2,
                    code: 'A1'
                }, {
                    index: 3,
                    code: 'A2'
                }],
                icon: 'Office13_2',
                documentCategories: [{
                    type: 'scenario',
                    categories: [{
                        _id: '558a614d8963451025d9428a',
                        code: 'START_DOC',
                        displayName: 'Start Doc',
                        allowedAmount: '1',
                        notifications: true,
                        order: 1,
                        fileSize: 20971520,
                        __v: 0
                    }, {
                        _id: '558a614d8963451025d9428c',
                        code: 'END_DOC',
                        displayName: 'End Doc',
                        allowedAmount: '1',
                        notifications: true,
                        order: 1,
                        fileSize: 20971520,
                        __v: 0
                    }, {
                        _id: '558a614d8963451025d9428b',
                        code: 'DEV_DOC',
                        displayName: 'Dev Doc',
                        allowedAmount: '*',
                        notifications: false,
                        order: 1,
                        fileSize: 20971520,
                        __v: 0
                    }]
                }, {
                    type: 'cms_project',
                    categories: [{
                        _id: '558a614d8963451025d9428a',
                        code: 'START_DOC',
                        displayName: 'Start Doc',
                        allowedAmount: '1',
                        notifications: true,
                        order: 1,
                        fileSize: 20971520,
                        __v: 0
                    }]
                }]
            }
        };

        var sampleScenario = {
            _id: '55558ca626c2edd81cfef0e9',
            friendlyId: 'GO13.AC13.03.3A.02.A2',
            eTextURL: 'http://view.ebookplus.pearsoncmg.com/ebook/linktoebook4.do?platform=1052&bookid=25137&startpage=644&endpage=645&hid=8592538db99457abbe735775b74ec8df',
            videoURL: 'http://media.pearsoncmg.com/ph/bp/bp_video_links/2014/it/show_me_videos/go/GO_ACC_Ch3/Access_Ch3_Obj1_302/Access_Ch3_Obj1_302.html',
            title: 'AC Activity 3.02: Creating a Form and Viewing Records',
            pageNo: '644',
            type: 'A2',
            phase: 'AUT',
            taskId: '5549e405e20c0104052ad199',
            documents: [
                {
                    category: {
                        _id: '558a614d8963451025d9428b',
                        code: 'DEV_DOC',
                        displayName: 'Dev Doc',
                        allowedAmount: '*',
                        notifications: false,
                        order: 4,
                        fileSize: 20971520,
                        __v: 0
                    },
                    file: [
                        {
                            _id: '55adf4ee074fc764258e25b1',
                            __t: 'files',
                            originalName: '03_Satrt.jpg',
                            fileType: 'image/jpeg',
                            fileSize: 164172,
                            timeStamp: addedDate,
                            tmpName: '03_Satrt1437463790642.jpg',
                            location: '/tmp/test/55840ba7e19e231c258dd539/55840cce130b38d80c1fb066',
                            __v: 0,
                            documentVersion: 1,
                            updatedTimestamp: '2015-07-21T07:29:50.658Z',
                            createdTimestamp: '2015-07-21T07:29:50.657Z',
                            select: false
                        },
                        {
                            _id: '55adf4f0074fc764258e25b3',
                            __t: 'files',
                            originalName: '04_End.jpg',
                            fileType: 'image/jpeg',
                            fileSize: 110152,
                            timeStamp: addedDate,
                            tmpName: '04_End1437463792847.jpg',
                            location: '/tmp/test/55840ba7e19e231c258dd539/55840cce130b38d80c1fb066',
                            __v: 0,
                            documentVersion: 1,
                            updatedTimestamp: '2015-07-21T07:29:52.850Z',
                            createdTimestamp: '2015-07-21T07:29:52.849Z',
                            select: false
                        }
                    ]
                },
                {
                    category: {
                        _id: '558a614d8963451025d9428a',
                        code: 'START_DOC',
                        displayName: 'Start Doc',
                        allowedAmount: '1',
                        notifications: true,
                        order: 1,
                        fileSize: 20971520,
                        __v: 0
                    },
                    file: [
                        {
                            _id: '55b06f3a835517f02d85e5fd',
                            __t: 'files',
                            originalName: 'EXP13_OF13_01_01_01_T1_START_DOC.txt',
                            fileType: 'text/plain',
                            fileSize: 1131,
                            timeStamp: addedDate,
                            tmpName: 'EXP13_OF13_01_01_01_T1_START_DOC1437626170933.txt',
                            location: '/tmp/test/55840ba7e19e231c258dd539/55840cce130b38d80c1fb066',
                            __v: 0,
                            documentVersion: 1,
                            updatedTimestamp: '2015-07-23T04:36:10.938Z',
                            createdTimestamp: '2015-07-23T04:36:10.937Z',
                            select: false
                        }
                    ]
                }
            ],
            documentVersion: 0,
            updatedTimestamp: '2015-05-15T06:05:26.579Z',
            createdTimestamp: '2015-05-15T06:05:26.579Z',
            steps: [],
            user: {}
        };

        var newFileItem = {
            _id: '55adf4ee074fc764258e25b5',
            __t: 'files',
            originalName: 'test.txt',
            fileType: 'text',
            fileSize: 2000,
            timeStamp: addedDate,
            tmpName: 'test1437463790642.jpg',
            location: '/tmp/test/55840ba7e19e231c258dd539/55840cce130b38d80c1fb066',
            __v: 0,
            documentVersion: 1,
            updatedTimestamp: '2015-07-21T07:29:50.658Z',
            createdTimestamp: '2015-07-21T07:29:50.657Z',
            select: false
        };

        var fileItems = [{
            category: {
                _id: '558a614d8963451025d9428b',
                code: 'DEV_DOC',
                displayName: 'Dev Doc',
                allowedAmount: '*',
                notifications: false,
                order: 4,
                fileSize: 20971520,
                __v: 0
            },
            file: [
                {
                    _id: '55adf4ee074fc764258e25b1',
                    __t: 'files',
                    originalName: '03_Satrt.jpg',
                    fileType: 'image/jpeg',
                    fileSize: 164172,
                    timeStamp: addedDate,
                    tmpName: '03_Satrt1437463790642.jpg',
                    location: '/tmp/test/55840ba7e19e231c258dd539/55840cce130b38d80c1fb066',
                    __v: 0,
                    documentVersion: 1,
                    updatedTimestamp: '2015-07-21T07:29:50.658Z',
                    createdTimestamp: '2015-07-21T07:29:50.657Z',
                    select: false,
                    timeStampDisplay: addedDate.toLocaleString()
                },
                {
                    _id: '55adf4f0074fc764258e25b3',
                    __t: 'files',
                    originalName: '04_End.jpg',
                    fileType: 'image/jpeg',
                    fileSize: 110152,
                    timeStamp: addedDate,
                    tmpName: '04_End1437463792847.jpg',
                    location: '/tmp/test/55840ba7e19e231c258dd539/55840cce130b38d80c1fb066',
                    __v: 0,
                    documentVersion: 1,
                    updatedTimestamp: '2015-07-21T07:29:52.850Z',
                    createdTimestamp: '2015-07-21T07:29:52.849Z',
                    select: false,
                    timeStampDisplay: addedDate.toLocaleString()
                }
            ]
        },
            {
                category: {
                    _id: '558a614d8963451025d9428a',
                    code: 'START_DOC',
                    displayName: 'Start Doc',
                    allowedAmount: '1',
                    notifications: true,
                    order: 1,
                    fileSize: 20971520,
                    __v: 0
                },
                file: [
                    {
                        _id: '55b06f3a835517f02d85e5fd',
                        __t: 'files',
                        originalName: 'EXP13_OF13_01_01_01_T1_START_DOC.txt',
                        fileType: 'text/plain',
                        fileSize: 1131,
                        timeStamp: addedDate,
                        tmpName: 'EXP13_OF13_01_01_01_T1_START_DOC1437626170933.txt',
                        location: '/tmp/test/55840ba7e19e231c258dd539/55840cce130b38d80c1fb066',
                        __v: 0,
                        documentVersion: 1,
                        updatedTimestamp: '2015-07-23T04:36:10.938Z',
                        createdTimestamp: '2015-07-23T04:36:10.937Z',
                        select: false,
                        timeStampDisplay: addedDate.toLocaleString()
                    }
                ]
            }, {
                category: {
                    _id: '558a614d8963451025d9428c',
                    code: 'END_DOC',
                    displayName: 'End Doc',
                    allowedAmount: '1',
                    notifications: true,
                    order: 1,
                    fileSize: 20971520,
                    __v: 0,
                    disabled: false
                },
                file: []
            }];

        var newFileItems = [{
            category: {
                _id: '558a614d8963451025d9428b',
                code: 'DEV_DOC',
                displayName: 'Dev Doc',
                allowedAmount: '*',
                notifications: false,
                order: 4,
                fileSize: 20971520,
                __v: 0
            },
            file: [
                {
                    _id: '55adf4ee074fc764258e25b1',
                    __t: 'files',
                    originalName: '03_Satrt.jpg',
                    fileType: 'image/jpeg',
                    fileSize: 164172,
                    timeStamp: addedDate,
                    tmpName: '03_Satrt1437463790642.jpg',
                    location: '/tmp/test/55840ba7e19e231c258dd539/55840cce130b38d80c1fb066',
                    __v: 0,
                    documentVersion: 1,
                    updatedTimestamp: '2015-07-21T07:29:50.658Z',
                    createdTimestamp: '2015-07-21T07:29:50.657Z',
                    select: false,
                    timeStampDisplay: addedDate.toLocaleString()
                },
                {
                    _id: '55adf4f0074fc764258e25b3',
                    __t: 'files',
                    originalName: '04_End.jpg',
                    fileType: 'image/jpeg',
                    fileSize: 110152,
                    timeStamp: addedDate,
                    tmpName: '04_End1437463792847.jpg',
                    location: '/tmp/test/55840ba7e19e231c258dd539/55840cce130b38d80c1fb066',
                    __v: 0,
                    documentVersion: 1,
                    updatedTimestamp: '2015-07-21T07:29:52.850Z',
                    createdTimestamp: '2015-07-21T07:29:52.849Z',
                    select: false,
                    timeStampDisplay: addedDate.toLocaleString()
                },
                {
                    _id: '55adf4ee074fc764258e25b5',
                    __t: 'files',
                    originalName: 'test.txt',
                    fileType: 'text',
                    fileSize: 2000,
                    timeStamp: addedDate,
                    tmpName: 'test1437463790642.jpg',
                    location: '/tmp/test/55840ba7e19e231c258dd539/55840cce130b38d80c1fb066',
                    __v: 0,
                    documentVersion: 1,
                    updatedTimestamp: '2015-07-21T07:29:50.658Z',
                    createdTimestamp: '2015-07-21T07:29:50.657Z',
                    select: false,
                    timeStampDisplay: addedDate.toLocaleString()
                }
            ]
        },
            {
                category: {
                    _id: '558a614d8963451025d9428a',
                    code: 'START_DOC',
                    displayName: 'Start Doc',
                    allowedAmount: '1',
                    notifications: true,
                    order: 1,
                    fileSize: 20971520,
                    __v: 0
                },
                file: [
                    {
                        _id: '55b06f3a835517f02d85e5fd',
                        __t: 'files',
                        originalName: 'EXP13_OF13_01_01_01_T1_START_DOC.txt',
                        fileType: 'text/plain',
                        fileSize: 1131,
                        timeStamp: addedDate,
                        tmpName: 'EXP13_OF13_01_01_01_T1_START_DOC1437626170933.txt',
                        location: '/tmp/test/55840ba7e19e231c258dd539/55840cce130b38d80c1fb066',
                        __v: 0,
                        documentVersion: 1,
                        updatedTimestamp: '2015-07-23T04:36:10.938Z',
                        createdTimestamp: '2015-07-23T04:36:10.937Z',
                        select: false,
                        timeStampDisplay: addedDate.toLocaleString()
                    }
                ]
            }, {
                category: {
                    _id: '558a614d8963451025d9428c',
                    code: 'END_DOC',
                    displayName: 'End Doc',
                    allowedAmount: '1',
                    notifications: true,
                    order: 1,
                    fileSize: 20971520,
                    __v: 0,
                    disabled: false
                },
                file: []
            }
        ];

        var deleteFileItems = [{
            category: {
                _id: '558a614d8963451025d9428b',
                code: 'DEV_DOC',
                displayName: 'Dev Doc',
                allowedAmount: '*',
                notifications: false,
                order: 4,
                fileSize: 20971520,
                __v: 0
            },
            file: [
                {
                    _id: '55adf4f0074fc764258e25b3',
                    __t: 'files',
                    originalName: '04_End.jpg',
                    fileType: 'image/jpeg',
                    fileSize: 110152,
                    timeStamp: addedDate,
                    tmpName: '04_End1437463792847.jpg',
                    location: '/tmp/test/55840ba7e19e231c258dd539/55840cce130b38d80c1fb066',
                    __v: 0,
                    documentVersion: 1,
                    updatedTimestamp: '2015-07-21T07:29:52.850Z',
                    createdTimestamp: '2015-07-21T07:29:52.849Z',
                    select: false,
                    timeStampDisplay: addedDate.toLocaleString()
                },
                {
                    _id: '55adf4ee074fc764258e25b5',
                    __t: 'files',
                    originalName: 'test.txt',
                    fileType: 'text',
                    fileSize: 2000,
                    timeStamp: addedDate,
                    tmpName: 'test1437463790642.jpg',
                    location: '/tmp/test/55840ba7e19e231c258dd539/55840cce130b38d80c1fb066',
                    __v: 0,
                    documentVersion: 1,
                    updatedTimestamp: '2015-07-21T07:29:50.658Z',
                    createdTimestamp: '2015-07-21T07:29:50.657Z',
                    select: false,
                    timeStampDisplay: addedDate.toLocaleString()
                }
            ]
        },
            {
                category: {
                    _id: '558a614d8963451025d9428a',
                    code: 'START_DOC',
                    displayName: 'Start Doc',
                    allowedAmount: '1',
                    notifications: true,
                    order: 1,
                    fileSize: 20971520,
                    __v: 0
                },
                file: [
                    {
                        _id: '55b06f3a835517f02d85e5fd',
                        __t: 'files',
                        originalName: 'EXP13_OF13_01_01_01_T1_START_DOC.txt',
                        fileType: 'text/plain',
                        fileSize: 1131,
                        timeStamp: addedDate,
                        tmpName: 'EXP13_OF13_01_01_01_T1_START_DOC1437626170933.txt',
                        location: '/tmp/test/55840ba7e19e231c258dd539/55840cce130b38d80c1fb066',
                        __v: 0,
                        documentVersion: 1,
                        updatedTimestamp: '2015-07-23T04:36:10.938Z',
                        createdTimestamp: '2015-07-23T04:36:10.937Z',
                        select: false,
                        timeStampDisplay: addedDate.toLocaleString()
                    }
                ]
            }, {
                category: {
                    _id: '558a614d8963451025d9428c',
                    code: 'END_DOC',
                    displayName: 'End Doc',
                    allowedAmount: '1',
                    notifications: true,
                    order: 1,
                    fileSize: 20971520,
                    __v: 0,
                    disabled: false
                },
                file: []
            }
        ];

        var category = {
            _id: '558a614d8963451025d9428b',
            code: 'DEV_DOC',
            displayName: 'Dev Doc',
            allowedAmount: '*',
            notifications: false,
            order: 1,
            fileSize: 20971520,
            __v: 0
        };

        beforeEach(module(ApplicationConfiguration.applicationModuleName, function ($translateProvider) {
            $translateProvider.translations('en', {});
        }));

        beforeEach(inject(function (_$controller_, _$httpBackend_, _$rootScope_) {
            $scope = _$rootScope_.$new();
            var $controller = _$controller_;
            $httpBackend = _$httpBackend_;
            itemCount = {value: 4};
            stateParams = {taskId: '5549e405e20c0104052ad199'};
            $httpBackend.when('GET', '/element/' + stateParams.taskId + '/series').respond(sampleSeries);
            $httpBackend.when('GET', '/scenario.file.client.view.html').respond("<div id='controllertemplate'>controller template</div>");
            controller = $controller('ScenarioDocumentController', {
                $scope: $scope,
                $stateParams: stateParams,
                $modalInstance: function () {
                },
                title: 'Scenario Document',
                contentId: '5549e405e20c0104052ad199',
                scenario: sampleScenario,
                itemCount: itemCount
            });
        }));

        beforeEach(inject(function (_ConfirmPopupService_) {
            ConfirmPopupService = _ConfirmPopupService_;
            spyOn(ConfirmPopupService, "showConfirm").and.callFake(function (title, message, callback) {
                callback(true);
            });
        }));

        it('get the missing documents', function () {
            $httpBackend.expectGET('/element/' + stateParams.taskId + '/series');
            $httpBackend.flush();
            expect($scope.fileItems.length).toEqual(fileItems.length);
        });

        it('upload document', function () {

            var file = [{name: 'test.txt', size: 30.0, type: 'text'}];

            //$httpBackend.when('POST', '/document/content/' + stateParams.taskId + '/scenario/' + sampleScenario._id).respond(newFileItem);

            $httpBackend.expectGET('/element/' + stateParams.taskId + '/series');
            $httpBackend.expectPOST('/document/content/' + stateParams.taskId + '/scenario/' + sampleScenario._id + '/category/' + category._id.toString()).respond(newFileItem);
            $scope.fileDropped(file, category);
            $httpBackend.flush();
            expect($scope.fileItems).toEqual(newFileItems);
        });

        it('delete document', function () {

            var file = [{name: 'test.txt', size: 30.0, type: 'text'}];

            //$httpBackend.when('POST', '/document/content/' + stateParams.taskId + '/scenario/' + sampleScenario._id).respond(newFileItem);

            $httpBackend.expectGET('/element/' + stateParams.taskId + '/series');
            $httpBackend.expectDELETE('/document/scenario/' + sampleScenario._id + '/category/' + category._id.toString() + '/file/55adf4ee074fc764258e25b1').respond(200, '');
            $scope.deleteFile('55adf4ee074fc764258e25b1', category);
            $httpBackend.flush();
            expect($scope.fileItems).toEqual(deleteFileItems);
        });

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });
    });
})
;
