'use strict';


define(['skillImportModule', 'angularMocks'], function(app) {
    describe('SkillGridController', function() {

        //Initialize global variables
        var scope,
            SkillGridController,
            state,
            rootScope,
            $httpBackend,
            $templateCache,
            template,
            $controller,
            $compile,
            notification,
            $timeout;

        var sampleScenario = { // for scenario GET call
            'friendlyId' : 'GO13.AC13.03.3A.02.A2',
            'taskId' : {
                app:'PPT'
            }
        };

        var sampleFilterData = {
            _id: '1234',
            children:[
                {
                _id: '567',
                parent: '891',
                path: '567#891',
                title: 'Blog'
                }
            ],
            id: 'APPLICATION',
            label: 'APPLICATION',
            path: '567',
            title: 'APPLICATION',
            value: 'APPLICATION'
        };

        var sampleData= {
            app: 'Word 2013',
            product:'Word',
            skillId: 'WIN_Application_3',
            title: 'Publish a Blog'
        };

        var sampleSkillList = [ // for skills GET call
            sampleData
        ];

        var categories = [
            {
                title:'Application',
                _id:'1234',
                children:[
                    {
                        _id:'567',
                        title:'test sub category'
                    }
                ]
            }
        ];

        var init=function(product){
            scope.commonData.product=product;
            SkillGridController = $controller('SkillGridController', {
                $scope: scope,
                $element :template,
                $state: state
            });
            if(product)
                $httpBackend.flush();
        };

        beforeEach(function() {
            jasmine.addMatchers({
                toEqualData: function(util, customEqualityTesters) {
                    return {
                        compare: function(actual, expected) {
                            return {
                                pass: angular.equals(actual, expected)
                            };
                        }
                    };
                }
            });
        });


        // Load the main application module
        beforeEach(module(ApplicationConfiguration.applicationModuleName, function ($translateProvider) {
            $translateProvider.translations('en', {});
        }));


        beforeEach(inject(function(_$controller_, _$rootScope_,_$state_,_$httpBackend_,
                                   _$templateCache_,_$compile_,notificationService,TextSearch,
                                   DataTransformer,$filter,skillLibraryService,_$timeout_) {
            scope = _$rootScope_.$new();
            rootScope = _$rootScope_;
            $controller=_$controller_;
            state = _$state_;

            notification=notificationService;

            scope.gridConfig =
            {
                title : 'grid',
                data :{
                    sourceData :scope.skills,
                    uniqueId : 'skillId'
                },
                searchConfig: {
                    placeholderText : '',
                    index : {},
                    indexedColumns : ['skillId', 'title', 'parentLabels0', 'parentLabels1']
                },
                rowHeight: 40,
                columns : [
                    {
                        field: 'parentLabels0',
                        displayName: 'Categories',
                        width: '20%',
                        searchConfig:{
                            type: 'dropdown',
                            dependentCols:[1],
                            options: []
                        }
                    },
                    {
                        field: 'parentLabels1',
                        displayName: 'Sub - Categories',
                        width: '20%',
                        searchConfig:{
                            type: 'dropdown',
                            options: []
                        }
                    }
                ]
            };
            scope.commonData={};
            $timeout = _$timeout_;

            $httpBackend = _$httpBackend_;
            $httpBackend.expect('GET','/product/'+sampleData.product+'/skills')
                .respond(sampleSkillList);
            $httpBackend.expect('GET','/products/'+sampleData.product+'/skills/categories/tree')
                .respond(categories);
            $templateCache = _$templateCache_;
            $compile = _$compile_;
            template = $($compile($templateCache.get('skill.grid.client.view.html'))(scope));
            spyOn(state, 'go');
            spyOn(scope, '$emit');
            spyOn(scope, '$broadcast').and.callThrough();
            spyOn(notification,'hideNotification').and.callThrough();
            scope.$digest();
        }));

        it('should check if all scope variables are initialized',function(){
            init(sampleData.product);
            expect(scope.gridConfig).toBeDefined();
            expect(scope.skills.length).toEqual(sampleSkillList.length);
            expect(scope.skills[0].skillId).toEqual(sampleSkillList[0].skillId);
            expect(scope.skillIndexTree).toBeDefined();
        });

       it('should check if all scope variables are initialized when app is set after scenarioReceived event',function(){
           init(null);
           expect(scope.skills).toEqual(null);
           scope.commonData.product=sampleData.product;
           scope.$broadcast('scenarioReceived');
           $httpBackend.flush();
           expect(scope.skills.length).toEqual(sampleSkillList.length);
           expect(scope.skills[0].skillId).toEqual(sampleSkillList[0].skillId);
        });

        it('should hide notification on stateChangeStart', function () {
            init(sampleData.product);
            rootScope.$broadcast('$stateChangeStart',{});
            expect(notification.hideNotification).toHaveBeenCalled();
         });

        it('should hide loading icon on stateChangeSuccess if skills are defined', function () {
            init(sampleData.product);
            scope.$broadcast('$stateChangeSuccess',{});
            expect(scope.$emit).toHaveBeenCalledWith('hideLoader');
        });

        it('should check that scope.skills should change on change the product',function()
        {
            init(sampleData.product);
            scope.commonData.product = sampleScenario.taskId.app;
            $httpBackend.expect('GET','/product/'+sampleScenario.taskId.app+'/skills')
                .respond(sampleSkillList);
            $httpBackend.expect('GET','/products/'+sampleScenario.taskId.app+'/skills/categories/tree')
                .respond(categories);
            $httpBackend.flush();
            expect(scope.skills.length).toEqual(sampleSkillList.length);
            expect(scope.skills[0].skillId).toEqual(sampleSkillList[0].skillId);
        });

        it('should not hide loading icon on stateChangeSuccess if skills are not defined', function () {
            init(sampleData.product);
            var count = scope.$emit.calls.count();
            scope.skills=null;
            scope.$apply();
            scope.$broadcast('$stateChangeSuccess',{});
            expect(scope.$emit.calls.count()).toEqual(count); // to check hideloader is not dispatched
        });

        it('should check that column filter change event is broadcast if column index is 0',function(){
            var columnIndex = 0;
            init(sampleData.product);
            var count = scope.$broadcast.calls.count();
            scope.onColumnFilter(columnIndex,sampleFilterData);
            scope.$broadcast('columnFilterChange',{columnIndex:columnIndex,options:sampleFilterData.children});
            expect(scope.$broadcast.calls.count()).toEqual(count+2);
        });



        afterEach(function() {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });
    });
});
