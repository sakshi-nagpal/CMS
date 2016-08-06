'use strict';

define(['testData/scenario', 'appModule', 'angularMocks'], function (sampleScenrio) {
    describe('Testing optionsModal', function () {
        var $compile,
            $rootScope,
            httpBackend,
            scope,
            $state,
            element,
            $timeout,
            isolatedScope;

        // Load the main application module
        beforeEach(module(ApplicationConfiguration.applicationModuleName, function ($translateProvider) {
            $translateProvider.translations('en', {});
        }));

        // Store references to $rootScope and $compile
        // so they are available to all tests in this describe block
        beforeEach(inject(function (_$compile_, _$rootScope_, _$state_, _$timeout_, _$httpBackend_) {
            // The injector unwraps the underscores (_) from around the parameter names when matching
            $compile = _$compile_;
            $rootScope = _$rootScope_;
            scope = $rootScope.$new();
            $state = _$state_;
            $timeout = _$timeout_;
            httpBackend = _$httpBackend_;
            scope.data = {};

            scope.sampleData = {
                'title' : 'Copy Scenario',
                'instruction' : 'Choose an Option to begin with:',
                'data' : [
                    {
                        'stateRef' : 'import.task.scenario({friendlyId: "GO13.WD13.03.3A.03.T1", sourceFriendlyId: "GO13.WD13.03.3A.03.A1"})',
                        'thumbnail' : 'scenario_viewer',
                        'caption' : 'Copy from Scenario A1'
                    },
                    {
                        'search' : true,
                        'searchInstruction' : 'Task Search',
                        'caption' : 'Copy from other task'
                    },
                    {
                        'thumbnail' : 'skill_index',
                        'caption' : 'Using Skill Index',
                        'event' : 'importSkillListener'
                    },
                    {
                        'search' : true,
                        'searchInstruction' : 'TaskID Search',
                        'caption' : 'Using Task ID',
                        'disable' : true
                    }
                ]
            };

            // Compile a piece of HTML containing the directive
            element = $compile('<div><div class="innerDiv" options-modal="sampleData"></div></div>')(scope);
            // fire all the watches, so the scope expressions will be evaluated
            scope.$apply();
            isolatedScope = element.find('.innerDiv').isolateScope() || element.scope();
        }));

        it('Replaces the element with the appropriate content', function () {
            expect(element.find('.modal-dialog')).toBeTruthy();
            expect(element.find('.options-modal')).toBeTruthy();
            expect(element.find('.list').length).toBe(4);
            expect(element.find('.title').html()).toContain(scope.sampleData.title);
            expect(element.find('.list').eq(0).html()).toContain(scope.sampleData.data[0].caption);
            expect(element.find('.list').eq(1).find('.search')).toBeTruthy();
            expect(element.find('.list').eq(1).find('[disabled]').length).toBe(0);
            expect(element.find('.list').eq(1).html()).toContain(scope.sampleData.data[1].searchInstruction);
        });

        it('should paint the dom with disabled search text box', function () {
            expect(element.find('.list').find('[disabled]').length).toBe(1);
            expect(element.find('.list').find('.search[disabled]')).toBeTruthy();
        });

        it('should invoke the ng-click event.', function () {
            spyOn(isolatedScope, 'callback').and.callThrough();
            var targetElement = element.find('.list').find('[ng-click*="callback"]');
            expect(targetElement).toBeTruthy();
            targetElement.trigger('click');
            expect(isolatedScope.callback).toHaveBeenCalled();
        });

        it('should call task search method if search text is added', function () {
            httpBackend.whenGET('scenarios/exists?searchText='+ "GO13.WD13.03.3A.03.T1").respond(sampleScenrio);
            isolatedScope.optionsModal.taskSearchText = 'GO13.WD13.03.3A.03.T1';
            element.find('.baloo-icon-search').click();
        }) ;

        it('success callback on task search should null taskSearchText', function () {
            isolatedScope.successCB();
            expect(isolatedScope.optionsModal.taskSearchText).toBe(null);
        });
    });
});
