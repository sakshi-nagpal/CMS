'use strict';

define(['skillLibraryModule', 'angularMocks'], function () {
    describe('Testing addStep', function () {
        var $compile,
            $rootScope,
            scope,
            $state,
            element,
            $timeout,
            $httpBackend,
            $stateParams;
        var steps ={
            _id :1
        };


        // Load the main application module
        beforeEach(module(ApplicationConfiguration.applicationModuleName, function ($translateProvider) {
            $translateProvider.translations('en', {});
        }));

        // Store references to $rootScope and $compile
        // so they are available to all tests in this describe block
        beforeEach(inject(function (_$compile_, _$filter_, _$state_, _$timeout_,_$rootScope_, _$httpBackend_, _$stateParams_) {
            // The injector unwraps the underscores (_) from around the parameter names when matching
            $compile = _$compile_;
            $rootScope = _$rootScope_;
            scope = $rootScope.$new();
            $state = _$state_;
            $timeout = _$timeout_;
            $httpBackend = _$httpBackend_;
            $stateParams = _$stateParams_;
            $stateParams.app = 'Word 2013';
            scope.addStepPopupConfig =
                {
                    header:'dummyHeader',
                    labels:[
                        {
                            title : 'Skill Name',
                            value : 'Dummy Skill'
                        }
                    ],
                    endpoint:'libraryStep.edit'
                };
            scope.stateConfig ={
                stateToGo :"skill.browse.2",
                stateToGoParams : {
                    app: 'WORD',
                    skill: ''
                }
            };
            scope.stepData ={
                product :'WORD',
                skills :{}
            };


            // Compile a piece of HTML containing the directive
            element = $compile('<div class="container"><add-step user-can="edit_content" state-config="stateConfig" step-data="stepData" add-step-popup-config="addStepPopupConfig"></add-step></div>')(scope);
            // fire all the watches, so the scope expressions will be evaluated
            scope.$apply();
            scope = element.children().isolateScope();
        }));

      /*  it('should save library step on save button click', function () {
            scope.libStepName = "New Step";
            $httpBackend.expect('POST', 'library/step/create',{stepName: scope.libStepName, stepData: scope.stepData}).respond(steps);
            spyOn($state, 'go');
            element.find('.save-button').eq(0).click();
            $httpBackend.flush();
            console.log(scope.addStepPopupConfig)
            expect($state.go).toHaveBeenCalledWith(scope.addStepPopupConfig.endpoint,{'stepId' : steps._id , 'app': $stateParams.app, config :scope.stateConfig});

        });*/

        it('should show error message on saving blank step name', function () {
            scope.libStepName = '';
            element.find('.save-button').eq(0).click();
            expect(scope.errorMsg).toEqual('library.addStepModal.label_addStep_error_blank_message');
        });

        it('should show error message on saving duplicate step name', function () {
            scope.libStepName = 'Step1';

            $httpBackend.expect('POST', 'library/step/create',{stepName: scope.libStepName, stepData: scope.stepData}).respond(400,{
                'message':'Library Step Name must be unique.'
            });
            element.find('.save-button').eq(0).click();
            $httpBackend.flush();
            expect(scope.errorMsg).toEqual('library.addStepModal.label_addStep_error_message');
        });
        


    });
});
