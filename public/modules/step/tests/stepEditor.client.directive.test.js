'use strict';

define(['testData/step', 'stepEditorModule', 'angularMocks'], function (sampleStepJson) {
    describe('stepEditor', function () {
        var $compile, scope, $rootScope, element, $document, $timeout, controller, stepJson;
        var methodClass = '.method';
        var actionClass = '.action';
        var actionListContainer = '.actionListContainer';
        var $method, methodCount, actionCount;

        // Load the main application module
        beforeEach(module(ApplicationConfiguration.applicationModuleName, function ($translateProvider) {
            $translateProvider.translations('en', {});
        }));

        // Store references to $rootScope and $compile
        // so they are available to all tests in this describe block
        beforeEach(inject(function (_$compile_, _$rootScope_, _$document_, _$timeout_) {
            // The injector unwraps the underscores (_) from around the parameter names when matching
            $compile = _$compile_;
            scope = _$rootScope_.$new();
            $rootScope = _$rootScope_;
            $document = _$document_;
            $timeout = _$timeout_;

            stepJson = sampleStepJson;
            scope.stepJson = angular.copy(stepJson);
            scope.methodTypes = [
                'Keyboard',
                'Ribbon'
            ];
            scope.stepIndex = 0;
            scope.scenario = '';
            scope.timerDelay = 0;
            scope.saveData = function () {
            };
            scope.editorClose = function (step) {
            };
            scope.deleteStep = function (step) {
            };
            scope.onStepClick = function (index) {
            };

            // Compile a piece of HTML containing the directive
            element = angular.element('<step-editor step-json="stepJson" method-types="methodTypes" scenario="scenario" step-index="stepIndex" save-data= "saveData()" timer-delay="timerDelay" editor-close="editorClose()" delete-step="deleteStep()" on-step-click="onStepClick(index)"></step-editor>');
            element = $compile(element)(scope);

            scope.$apply();
            controller = element.controller('stepEditor');

            scope = element.isolateScope() || element.scope();
           try {
               $document.find('body').html('');
           } catch(err){}

            $document.find('body').append(element);
            $timeout.flush();

        }));

        beforeEach(function (done) {
            //window.jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
            var timeOut = function () {
                setTimeout(function () {
                    if (scope.totalMethods && scope.totalMethods == scope.stepJson.methods.length) {
                        $timeout.flush();
                        done();
                    }
                    else timeOut();
                }, 10);
            };
            timeOut();
        });

        beforeEach(function () {
            $method = element.find(methodClass).eq(0);
            actionCount = $method.find(actionClass).length;
            methodCount = element.find(methodClass).length;
        });
        it('initial focus should be on first method', function () {
            var fakeFocusTop = $method.find('div.fakeFocus').position().top;
            expect($method.hasClass('focused')).toBeTruthy();
            expect(actionCount).toBe(scope.stepJson.methods[0].actions.length);
            expect(fakeFocusTop).toBeTruthy();
            expect($('.methodTypeDropDown').val()).toBe(scope.stepJson.methods[0].type);
            expect($method.find('.baloo-icon-filled-star').length).toBe(1);
        });

        it('addAction button click should add new action and adjust the fakefocusdiv', function () {
            spyOn(scope, 'saveData').and.callThrough();
            var fakeFocusTop = $method.find('div.fakeFocus').position().top;

            element.find('.addAction')[0].click();
            $timeout.flush();
            expect(scope.saveData).toHaveBeenCalled();
            expect(element.find('.fakeFocus').position().top).toBeGreaterThan(fakeFocusTop);
            expect($method.find(actionClass).length - actionCount).toBe(1);
            expect(scope.stepJson.methods[0].actions.length).toBe(stepJson.methods[0].actions.length + 1);
        });

        it('deleteAction button click should delete current action and adjust the fakefocusdiv', function () {
            spyOn(scope, 'saveData').and.callThrough();

            var $actionButton = $method.find(actionClass + 'DeleteButton');
            var fakeFocusTop = $method.find('div.fakeFocus').position().top;

            $actionButton.click();
            $timeout.flush();

            expect(scope.stepJson.methods[0].actions.length).toBe(stepJson.methods[0].actions.length - 1);
            expect(scope.saveData).toHaveBeenCalled();
            expect(element.find('.fakeFocus').position().top).toBeLessThan(fakeFocusTop);
            expect(actionCount - $method.find(actionClass).length).toBe(1);
        });

        it('findReplace button click should toggle find replace band', function () {
            element.find('.editorHeader').find('.navbar-right > button').eq(0).click();
            expect(element.find('#findReplaceBand.visible').length).toBe(1);
            expect(element.find(methodClass).eq(0).hasClass('partialFocus'));

            element.find('.editorHeader').find('.navbar-right > button').eq(0).click();
            expect(element.find('#findReplaceBand.visible').length).toBe(0);
        });

        it('findReplace functionality 1', function (done) {
            scope.findPattern = 'three';
            scope.$digest();
            var totalOccurrence = JSON.stringify(stepJson).match(/three/ig).length;
            setTimeout(function () {

                expect($('span[data-cke-highlight="2"]').length).toBe(totalOccurrence);  //check for occurrences
                done();
            }, 10);
            expect(element.find('#finderMessage').html()).toContain('2 occurrence(s) found');  //check for message
        });

        it('findReplace functionality 2', function (done) {
            scope.findPattern = 'Sel';
            scope.$digest();
            element.find('.findReplaceBox > button').eq(2).click();

            setTimeout(function () {
                expect($('span[data-cke-highlight="1"]').length).toBe(1);  //first occurrence should highlight
                done();
            }, 10);
        });

        it('findReplace functionality 3', function (done) {
            scope.findPattern = 'Sel';
            scope.$digest();
            var totalOccurrence = JSON.stringify(scope.stepJson).match(/sel/ig).length;
            scope.replaceText = '123';
            element.find('.findReplaceBox > button').eq(3).click();


            setTimeout(function () {
                    expect($('span[data-cke-highlight="1"]').length).toBe(1);
                    //first occurrence should be replaced

                element.find('.findReplaceBox > button').eq(3).click();
                expect(JSON.stringify(scope.stepJson).match(/123/gi).length).toBe(1);
                $timeout(function() {

                });
                    done();
            }, 10);
        });

        it('findReplace functionality 4', function (done) {
            scope.findPattern = 'Sel';
            scope.$digest();
            var totalOccurrence = JSON.stringify(scope.stepJson).match(/sel/ig).length;
            scope.replaceText = '123';

            element.find('.findReplaceBox > button').eq(4).click();

            setTimeout(function () {
                    expect($('span[data-cke-highlight="2"]').length).toBe(0); //all occurrence should be replaced
                    expect(JSON.stringify(scope.stepJson).match(/123/gi).length).toBe(totalOccurrence);
                    done();
            }, 10);
        });

        it('insertMethod icon in method header should add new method below it', function () {
             spyOn(scope, 'saveData').and.callThrough();

             $method.find('.baloo-icon-add-method').click();
             $timeout.flush();

             expect(scope.saveData).toHaveBeenCalled();

             expect(element.find(methodClass).length - methodCount).toBe(1);
             expect(scope.stepJson.methods.length).toBe(stepJson.methods.length + 1);
             expect(element.find(methodClass + '.focused')).toBeTruthy();
         });


        it('insertMethod button click should add new method at the end', function () {
             spyOn(scope, 'saveData').and.callThrough();

             element.find('.insertMethod').click();
             $timeout.flush();

             expect(scope.saveData).toHaveBeenCalled();
             expect(element.find(methodClass).length - methodCount).toBe(1);
             expect(scope.stepJson.methods.length).toBe(stepJson.methods.length + 1);
             expect(element.find('.method2.focused')).toBeTruthy();
         });


        it('cancel in deleteMethod popup should not delete method', function () {
            $method.find('.baloo-icon-trash').click();
            $method.find('.confirmButtons > button:nth-child(2)').click();
            //cancel button click should not delete method
            expect(scope.stepJson.methods.length).toBe(stepJson.methods.length);
        });

        it('confirm in deleteMethod button click should delete that method', function () {
            spyOn(scope, 'saveData').and.callThrough();

            $method.find('.baloo-icon-trash').click();
            $method.find('.confirmButtons > button:first-child').click();
            $timeout.flush();

            expect(scope.saveData).toHaveBeenCalled();
            expect(methodCount - element.find(methodClass).length).toBe(1);
            expect(scope.stepJson.methods.length).toBe(stepJson.methods.length - 1);
        });

        it('cloneMethod button click should clone existing method below it', function () {
             spyOn(scope, 'saveData').and.callThrough();

             $method.find('.baloo-icon-clone-method').click();
             $timeout.flush();

             expect(scope.saveData).toHaveBeenCalled();
             expect(element.find(methodClass).length - methodCount).toBe(1);
             expect(element.find(methodClass + ':nth-child(2)').find(actionClass).length).toBe(actionCount);
             expect(scope.stepJson.methods.length).toBe(stepJson.methods.length + 1);
             expect(scope.stepJson.methods[1].type).toBe(stepJson.methods[0].type);
             expect(element.find(methodClass + '.focused')).toBeTruthy();
         });

        it('primary method button click should make that method primary', function () {
            spyOn(scope, 'saveData').and.callThrough();

            var $otherMethod = element.find(methodClass).eq(1);
            $otherMethod.find('.makePrimaryMethodIcon').click();
            $timeout.flush();

            expect(scope.saveData).toHaveBeenCalled();
            expect(scope.stepJson.methods[1].primary).toBe(true);
            expect(scope.stepJson.methods[0].primary).toBe(false);
            expect($otherMethod.find('.baloo-icon-filled-star').length).toBe(1);
            expect($method.find('.baloo-icon-filled-star').length).toBe(0);
        });

        it('Enter Key on action should add new action below it', function () {
            spyOn(scope, 'saveData').and.callThrough();

            var $method = element.find(methodClass).eq(0);
            var fakeFocusTop = $method.find('div.fakeFocus')[0].offsetTop;
            var actionCount = $method.find(actionClass).length;

            var event = document.createEvent('Events');
            event.initEvent('keydown', false, true);
            event.keyCode = 13;

            $method.find(actionListContainer)[0].dispatchEvent(event);
            $timeout.flush();

            expect(scope.saveData).toHaveBeenCalled();
            expect(element.find('div.fakeFocus')[0].offsetTop).toBeGreaterThan(fakeFocusTop);
            expect($method.find(actionClass).length - actionCount).toBe(1);
            expect(scope.stepJson.methods[0].actions.length).toBe(stepJson.methods[0].actions.length + 1);
            //stepjson
        });

        it('delete key should work as expected', function () {
            spyOn(scope, 'saveData').and.callThrough();

            var $actionListContainer = element.find(methodClass).eq(0).find(actionListContainer)[0];

            var event = document.createEvent('Events');
            event.initEvent('keydown', false, true);
            event.keyCode = 46;
            $actionListContainer.dispatchEvent(event);
            $timeout.flush();
            expect(scope.saveData).toHaveBeenCalled();
        });


        it('tabKeyPressed should move focus to next block if exists', function () {
            var $method = element.find(methodClass).eq(0);

           /* var event = document.createEvent('Events');
            event.initEvent('keydown', true, true);
            event.keyCode = 9;
            document.dispatchEvent(event);
            expect(element.find('.method2.focused').length).toBe(1);

            //item editor click handler and validate partial focus on focused method
            element.find('.itemEditorContainer').click();
            expect(element.find('.method1').length).hasClass('partialFocus');*/

            var event = document.createEvent('Events');
            element.find('.method1').addClass('partialFocus');
            event = document.createEvent('Events');
            event.initEvent('keydown', true, true);
            event.keyCode = 9;
            document.dispatchEvent(event);  //tabkey handler of controller: first case
            expect(element.find('.method1.partialFocus').length).toBe(0);

        });

        it('backKeyPressed should work as expected', function() {
             spyOn(scope, 'methodKeyDown').and.callThrough();

             var $actionListContainer = element.find(methodClass).eq(0).find(actionListContainer)[0];

             var event = document.createEvent('Events');
             event.initEvent('keydown', false, true);
             event.keyCode = 8;

             $actionListContainer.dispatchEvent(event);
             $timeout.flush();
             expect(scope.methodKeyDown).toHaveBeenCalled();

             $actionListContainer.blur();
             $actionListContainer.dispatchEvent(event);
             $timeout.flush();
             expect(scope.methodKeyDown).toHaveBeenCalled();
         });


        /*it('methodType dropdown should work as expected', function() {
             var $method = element.find(methodClass).eq(0);
             var $selectpicker = $method.find('.methodTypeDropDown');
            spyOn(scope, 'saveData').and.callThrough();
            scope.stepJson.methods[0].type = 'Keyboard';
            $selectpicker.selectpicker('render');

            *//*scope.$apply();
            scope.methodTypeChangeHandler();*//*
            expect(scope.saveData).toHaveBeenCalled();
         });*/

       /* //if already covered remove this block
        it('mouseup, blur, focus, keydown on action should work as expected', function() {
             spyOn(scope, 'actionListFocusHandler').and.callThrough();
             spyOn(scope, 'actionListBlurHandler').and.callThrough();
             spyOn(scope, 'actionListKeyDownHandler').and.callThrough();
             spyOn(scope, 'actionListMouseUpHandler').and.callThrough();

             var $actionListContainer = element.find(methodClass).eq(0).find(actionListContainer);
             $actionListContainer.blur();
             expect(scope.actionListBlurHandler).toHaveBeenCalled();

             $actionListContainer = element.find(methodClass).eq(1).find(actionListContainer);
             $actionListContainer.focus();
             expect(scope.actionListFocusHandler).toHaveBeenCalled();
             expect(scope.actionListBlurHandler).toHaveBeenCalled();

             var event = document.createEvent('Events');
             event.initEvent('keydown', true, true);
             event.keyCode = 9;
             $actionListContainer[0].dispatchEvent(event);
             expect(scope.actionListBlurHandler).toHaveBeenCalled();

             event = document.createEvent('Events');
             event.initEvent('mouseup', true, true);
             $actionListContainer[0].dispatchEvent(event);
             expect(scope.actionListMouseUpHandler).toHaveBeenCalled();
         });*/

        it('click on method block adds focus to it', function () {
            spyOn(scope, 'methodMouseDownHandler').and.callThrough();
            var event = document.createEvent('Events');
            event.initEvent('mousedown', true, true);
            var $method = element.find(methodClass).eq(0);
            $method[0].dispatchEvent(event);
            expect(scope.methodMouseDownHandler).toHaveBeenCalled();
        });

        it('click on step block adds focus to it', function () {
            var $stepText = element.find('.stepText');
            $stepText.focus();
            expect($stepText.parent().hasClass('focused')).toBeTruthy();
            expect($method.hasClass('focused')).toBeFalsy();
        });

        it('step switcher should save last step and launch new one', function () {
            spyOn(scope, 'onStepClick').and.callThrough();
            scope.onChangeStep(2);
            expect(scope.onStepClick).toHaveBeenCalledWith({index:2});
        });

        it('scope should be destroyed after step editor is closed', function () {
            spyOn(scope, 'saveData').and.callThrough();
            scope.$destroy();
            expect(scope.saveData).toHaveBeenCalled();
            expect(controller.unbindUndoStackListener.length).toBe(0);
        });

    });

});









