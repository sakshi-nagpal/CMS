'use strict';

define ([
    'jqueryScrollIntoView',
    'modules/common/util/movable'
], function() {

    return ['stepEditor',['$timeout', '$rootScope', '$sce', function ($timeout, $rootScope, $sce) {
        return {
            restrict: 'E',
            require: ['stepEditor'],
            scope: {
                stepJson: '=',
                methodTypes: '=',
                timerDelay: '=',
                scenario: '=',
                stepIndex: '=',
                saveData: '&',
                editorClose: '&',
                deleteStep: '&',
                onStepClick:'&',
                scenarioSiblings: '=?',
                onSwitchScenario:'&',
                onStepEditorInitialise:'&',
                isLibrary :'=?',
                errorMessage: '=?'
            },
            templateUrl: 'stepEditorDirective.client.view.html',

            controller: function($scope, $element, $rootScope) {

                var CKEDITOR = window.CKEDITOR;
                var controllerObject = this;
                $scope.matchCase = false;

                controllerObject.setHiddenContainerDimensions = function(){
                    var helperDiv = $('<div />');
                    $element.find('.stepContainer').append(helperDiv);
                    var width = helperDiv.outerWidth();
                    $element.find('.step-text-hidden').css('width', width);
                    $element.find('.step-text-hidden').css('height', $element.find('.step-text').height());
                    helperDiv.remove();
                   // $element.find('.stepContainer').scroll();
                };

                controllerObject.updateStepContainerHeight = function() {
                    var height = $(window).height();
                    $element.find('.stepContainer').outerHeight(height - $element.find('.editorHeader').outerHeight());
                };

                controllerObject.tabKeyHandler = function(event) {
                    if(event.keyCode === 9 && event.target.tagName !== 'INPUT') {
                        var $targetEditor = $element.find('.focused.partialFocus');

                        if($targetEditor.length) {
                            event.preventDefault();
                            $targetEditor.removeClass('partialFocus');

                            if($targetEditor.hasClass('stepTextDiv')) {
                                $targetEditor.children('.stepText')[0].focus();
                            } else {
                                focusMethod(undefined, $targetEditor);
                            }
                        }
                    }
                };

                $element.find('.stepContainer').scroll(function() {

                    var y = $(this).scrollTop();
                    var hiddenContainer = $element.find('.step-text-hidden-container');

                    if (y > hiddenContainer.outerHeight() + 20 && hiddenContainer.data('animation-type') !== 'show') {
                        hiddenContainer.data('animation-type','show');
                        hiddenContainer.animate({
                            top: '0'
                        }, 200);

                    } else if(y <= hiddenContainer.outerHeight() + 20  && hiddenContainer.data('animation-type') !== 'hide'){
                        hiddenContainer.data('animation-type','hide');
                        hiddenContainer.animate({
                            top: -hiddenContainer.outerHeight() - 10
                        }, 180);
                    }
                });

                var properties = {
                    editor: null,
                    actionClasses: 'action',
                    currentFocusedAction: null,
                    actionLimit: 25,
                    stepChanged: false,
                    stepDeleteInitiated: false,
                    cancelSaveInitiated: false,
                    find: {
                        currentFindPattern: null
                    },
                    newMethod: {
                        type: null,
                        actions: [{text:''}],
                        primary: false
                    },
                    save: {
                        timer: null,
                        delay: $scope.timerDelay,
                        lastSavedJSON: angular.copy($scope.stepJson),
                        originalStepJSON: angular.copy($scope.stepJson)
                    }
                };

                var getCurrentElementRangeAfterCaret = function(contentEditableElement) {
                    var selRange, testRange, contents='';
                    if (window.getSelection) {
                        var sel = window.getSelection();
                        if (sel.rangeCount) {
                            selRange = sel.getRangeAt(0);
                            testRange = selRange.cloneRange();

                            testRange.selectNodeContents(contentEditableElement);
                            testRange.setStart(selRange.endContainer, selRange.endOffset);
                            contents = testRange.toString();
                        }
                    } else if (document.selection && document.selection.type !== 'Control') {
                        selRange = document.selection.createRange();
                        testRange = selRange.duplicate();

                        testRange.moveToElementText(contentEditableElement);
                        testRange.setEndPoint('StartToEnd', selRange);
                        contents = testRange.text;
                    }

                    return {
                        range: testRange,
                        contents: contents
                    };
                };

                var getCurrentElementRangeBeforeCaret = function(contentEditableElement) {
                    var selRange, testRange, contents='';
                    if (window.getSelection) {
                        var sel = window.getSelection();
                        if (sel.rangeCount) {
                            selRange = sel.getRangeAt(0);
                            testRange = selRange.cloneRange();

                            testRange.selectNodeContents(contentEditableElement);
                            testRange.setEnd(selRange.startContainer, selRange.startOffset);
                            contents = testRange.toString();
                        }
                    } else if (document.selection && document.selection.type !== 'Control') {
                        selRange = document.selection.createRange();
                        testRange = selRange.duplicate();

                        testRange.moveToElementText(contentEditableElement);
                        testRange.setEndPoint('EndToStart', selRange);
                        contents = testRange.text;
                    }

                    return {
                        range: testRange,
                        contents: contents
                    };
                };

                var getCaretPositionInfo = function(contentEditableElement) {
                    var atStart = getCurrentElementRangeBeforeCaret(contentEditableElement).contents === '',
                        atEnd = getCurrentElementRangeAfterCaret(contentEditableElement).contents === '';

                    return { atStart: atStart, atEnd: atEnd };
                };

                var setCaretPositionAtContentEditable = function(contentEditableElement, atStart) {
                    var range,selection;

                    if(document.createRange)//Firefox, Chrome, Opera, Safari, IE 9+
                    {
                        range = document.createRange();//Create a range (a range is a like the selection but invisible)
                        range.selectNodeContents(contentEditableElement);//Select the entire contents of the element with the range
                        range.collapse(atStart);//collapse the range to the end point. false means collapse to end rather than the start
                        selection = window.getSelection();//get the selection object (allows you to change selection)
                        selection.removeAllRanges();//remove any selections already made

                        // Set range.endOffset to 1 for IE browser as cursor was being set after <BR> tag added by CKEditor
                        if(!atStart && range.endOffset>1) {
                            range.setEnd(contentEditableElement, range.endOffset -1);
                        }

                        selection.addRange(range);//make the range you have just created the visible selection
                    }
                    else if(document.selection)//IE 8 and lower
                    {
                        range = document.body.createTextRange();//Create a range (a range is a like the selection but invisible)
                        range.moveToElementText(contentEditableElement);//Select the entire contents of the element with the range
                        range.collapse(atStart);//collapse the range to the end point. false means collapse to end rather than the start
                        range.select();//Select the range (make it the visible selection)
                    }
                };

                var getIndex = function(item, parent) {
                    parent = parent ? parent : item.parentNode;
                    var children = parent.children;
                    for(var i= 0, length=children.length; i<length; ++i) {
                        if(item === children[i])
                            return i;
                    }
                    return -1;
                };

                var getSelectionStart = function() {
                    var node = document.getSelection().anchorNode;
                    return (node && node.nodeType === 3 ? node.parentNode : node);
                };

                var focusAction = function(action, atStart) {
                    action.parentNode.parentNode.focus();
                    action.parentNode.focus();
                    action.focus();
                    setCaretPositionAtContentEditable(action, atStart);

                    focusCurrentAction();
                };

                var blurActionListContainer = function(actionListContainer) {
                    actionListContainer.blur();
                    actionListContainer.querySelector('.actionList').blur();
                };

                var focusActionList = function(actionList, actionIndex) {
                    var actionChildList = actionList.children,
                        actionListLength = actionChildList.length;

                    if(actionIndex === undefined || actionIndex === null || actionIndex >= actionListLength) {
                        actionIndex = actionListLength - 1;
                    }

                    focusAction(actionChildList[actionIndex]);
                };

                var focusMethod = function(methodIndex, $targetMethod, actionIndex) {
                    $timeout(function() {
                        $targetMethod = $targetMethod ? $targetMethod : $element.find('.method'+(methodIndex+1));
                        var actionList = $targetMethod.find('.actionList')[0];
                        focusActionList(actionList, actionIndex);
                    });
                };

                var getCurrentAction = function() {
                    var targetElement = getSelectionStart(),
                        $targetElement = $(targetElement);

                    if(!$targetElement.hasClass('action')) {
                        targetElement = $targetElement.closest('.action')[0];
                    }

                    return targetElement;
                };

                var updateActionsTitle = function(actionList) {
                    var $actionList = $(actionList);
                    if(!$actionList.hasClass('actionList')) {
                        actionList = $actionList.find('.actionList')[0];
                    }

                    var actionListChildren = actionList.children,
                        length = actionListChildren.length,
                        index = 0;

                    for(index; index<length; ++index) {
                        var action = actionListChildren[index];
                        if(action.tagName === 'LI') {
                            if(action.innerHTML === '') {
                                action.innerHTML = '&nbsp;';
                            }
                            actionListChildren[index].className = properties.actionClasses + ' action' + (index+1);
                        } else {
                            actionList.removeChild(action);
                        }

                    }

                    focusCurrentAction();
                };

                var addAction = function(actionList, targetAction) {
                    //If actions have reached the limit then don't add action any more
                    if(actionList.children.length >= properties.actionLimit)
                        return;
                    var newAction = document.createElement('li');
                    newAction.innerHTML = '&nbsp;';
                    newAction.className = properties.actionClasses;

                    saveInUndoStack();

                    if(targetAction) {
                        //enter key pressed
                        var rangeObjectAfterCaret = getCurrentElementRangeAfterCaret(targetAction),
                            content = rangeObjectAfterCaret.contents.trim();

                        if(content) {
                            newAction.innerHTML = content;
                            rangeObjectAfterCaret.range.deleteContents();
                        }

                        actionList.insertBefore(newAction, targetAction.nextSibling);
                    } else {
                        //add action button pressed
                        actionList.appendChild(newAction);
                    }

                    $timeout(function() {
                        updateActionsTitle(actionList);
                        focusAction(newAction, true);
                        saveInUndoStack();
                    });
                };

                var addMethod = function(methodIndex) {
                    var newMethod={};
                    angular.copy(properties.newMethod, newMethod);
                    if(!methodIndex) {
                        methodIndex = $scope.stepJson.methods.length;
                    }

                    $scope.stepJson.methods.splice(methodIndex, 0, newMethod);
                    //make first added method primary
                    if($scope.stepJson.methods.length === 1) {
                        $scope.stepJson.methods[0].primary = true;
                    }
                    focusMethod(methodIndex);
                };


                var blurCurrentAction = function() {
                    var $fakeFocusDiv = $element.find('div.fakeFocus');

                    $fakeFocusDiv.css({
                        height: 0,
                        top: 0,
                        display: 'none'
                    });

                    properties.currentFocusedAction = null;
                };


                var focusCurrentAction = function() {
                    $timeout(function() {
                        var currentFocusedAction = getCurrentAction();

                        if(currentFocusedAction) {
                            var $currentFocusedAction = $(currentFocusedAction),
                                $actionListContainer = $currentFocusedAction.parents('.actionListContainer'),
                                $method = $currentFocusedAction.parents('div.method'),
                                $fakeFocusDiv = $method.find('div.fakeFocus'),

                                $buttonContainer = $method.find('.actionButtonsContainer'),
                                $actions = $method.find('.action');

                            if(properties.currentFocusedAction !== currentFocusedAction) {
                                blurCurrentAction();
                                properties.currentFocusedAction = currentFocusedAction;
                            }

                            $fakeFocusDiv.css({
                                display: 'block',
                                height: $currentFocusedAction.outerHeight(),
                                top: $currentFocusedAction.position().top + $actionListContainer.position().top
                            });

                            //update action buttons position
                            $actions.each(function(i) {
                                $($buttonContainer[i]).css({
                                    height: $(this).outerHeight()
                                });
                            });
                        }
                    });
                };

                var addFocusedClassToStepText = function($focusedStepText) {
                    if(!$focusedStepText.hasClass('focused')) {
                        removeFocusedClassFromMethod($focusedStepText.siblings());
                        $focusedStepText.addClass('focused');
                    }
                    else {
                        $focusedStepText.removeClass('partialFocus');
                    }
                };

                var addFocusedClassToMethod = function($focusedMethod){
                    if(!$focusedMethod.hasClass('focused')) {
                        removeFocusedClassFromMethod($focusedMethod.siblings());
                        $focusedMethod.addClass('focused');
                        $focusedMethod.find('.buttonContainerList').show();
                        $focusedMethod.scrollIntoView();
                    }
                    else {
                        $focusedMethod.removeClass('partialFocus');
                    }
                };

                var removeFocusedClassFromMethod = function($focusedMethod){
                    $focusedMethod.removeClass('focused partialFocus');
                    $focusedMethod.find('.buttonContainerList').hide();
                    $focusedMethod.find('.deleteMethod').hide();
                };

                var saveInUndoStack = function() {
                    $rootScope.$emit('saveInUndoStack');
                };

                var lockSnapshot = function() {
                    $rootScope.$emit('lockSnapshot');
                };

                var unlockSnapshot = function() {
                    $rootScope.$emit('unlockSnapshot');
                };

                var stopEventDefault = function(event) {
                    event.stopPropagation();
                    event.preventDefault();
                };

                var enterKeyPressed = function(event) {
                    if($(event.target).hasClass('actionListContainer')) {
                        stopEventDefault(event);

                        var targetAction = getCurrentAction();
                        addAction(targetAction.parentNode, targetAction);
                    }
                };

                var handleEdgeBrowserIssue = function(event) {
                    if(navigator.userAgent.match(/Edge/ig)) {
                        var data;
                        if(event.target.innerHTML === '<br>') {
                            data = '';
                        }
                        else {
                            data = event.target.innerHTML;
                        }
                        var methodIndex = event.target.getAttribute('editor-index') - 1;
                        onMethodModelUpdate(data, methodIndex);
                        startSaveTimer();
                    }
                };

                var backKeyPressed = function(event) {
                    var targetAction = getCurrentAction();
                    if(targetAction) {
                        var actionList = targetAction.parentNode,
                            targetIndex = getIndex(targetAction, actionList);

                        if(getCaretPositionInfo(targetAction).atStart && getCurrentElementRangeAfterCaret(targetAction).range.startOffset === 0) {
                            if(targetIndex === 0) {
                                stopEventDefault(event);
                            }
                        }
                        $timeout(function() {
                            updateActionsTitle(actionList);
                        });
                    }
                    $timeout(function() {
                        handleEdgeBrowserIssue(event);
                    });

                };

                var deleteKeyPressed = function(event) {
                    var targetAction = getCurrentAction();
                    if(targetAction) {
                        var actionList = targetAction.parentNode,
                            targetMarkup = targetAction.innerHTML;

                        if(actionList.children.length === 1) {
                            if(targetMarkup === '<br>' || targetMarkup === '' || targetMarkup === '&nbsp;') {
                                stopEventDefault(event);
                            }
                        }

                        $timeout(function() {
                            updateActionsTitle(actionList);
                        });
                    }
                    $timeout(function() {
                        handleEdgeBrowserIssue(event);
                    });

                };

                var tabKeyPressed = function(event) {
                    event.stopPropagation();
                };

                var itemEditorInitializeHandler = function() {
                    makeMethodsMovable();
 					if($scope.stepJson.methods.length > 0){
                        focusMethod(0, undefined, 0);
                    } else {
                        $element.find('.stepTextDiv .stepText').focus();
                    }
                };

                var updateFinderMessage = function(message) {
                    var $finderMessage = $element.find('#finderMessage');
                    if(message) {
                        $finderMessage.html(message);
                    } else {
                        $finderMessage.html('');
                    }
                };

                var findOccurrences = function(forceSearch) {

                    if($scope.findPattern && (properties.find.currentFindPattern !== $scope.findPattern || forceSearch === true)) {
                        properties.find.currentFindPattern = $scope.findPattern;

                        properties.editor.execCommand('findAll', {
                            findPattern: $scope.findPattern,
                            callback: updateFinderMessage,
                            matchCase: $scope.matchCase
                        });
                    }
                };

                var findOccurrencesIfRequired = function() {

                    if($scope.findPattern) {
                        if($scope.findPattern.length > 2) {
                            findOccurrences();
                        }
                    } else {
                        if(properties.editor) {
                            properties.editor.execCommand('removeSearchRange');
                            updateFinderMessage();
                        }
                    }
                };
                $scope.saveStepName = function(){
                    $scope.saveData({isAutoSave: true});
                };

                var saveEditorChanges = function(isAutoSave, isCancel) {
                    if(isCancel) {
                        if(!angular.equals(properties.save.originalStepJSON, $scope.stepJson)){
                            angular.copy(properties.save.originalStepJSON, $scope.stepJson);
                            $scope.saveData({isAutoSave: true});
                        }

                    } else if(!angular.equals(properties.save.lastSavedJSON, $scope.stepJson)) {

                        properties.stepChanged = true;
                        if(angular.equals(properties.save.originalStepJSON, $scope.stepJson)){
                            isAutoSave = true;
                        }
                        $scope.saveData({isAutoSave: isAutoSave});
                        angular.copy($scope.stepJson, properties.save.lastSavedJSON);
                    } else if (isAutoSave === false && properties.stepChanged && !angular.equals(properties.save.originalStepJSON, $scope.stepJson)){
                        $scope.saveData({isAutoSave: isAutoSave});
                    }
                    properties.save.timer = null;
                };

                var startSaveTimer = function() {
                    if(!properties.save.timer) {
                        properties.save.timer = $timeout(function() {
                            saveEditorChanges(true);
                        }, properties.save.delay);
                    }
                };

                var onMethodModelUpdate = function(data, modelIndex) {
                    if(data !== undefined && data !== null) {
                        if(data.trim() === '') {

                            // lock ckeditor snapshot to avoid adding add action to undo stack
                            lockSnapshot();
                            data = '<ul class="actionList mbs ng-scope"></ul>';
                            $element.find('.actionListContainer').eq(modelIndex).html(data);
                            addAction($element.find('.actionList')[modelIndex]);

                            $timeout(function() {
                                //unlock ckeditor snapshot when action is added in case of delte all actions.
                                unlockSnapshot();
                            });
                        }

                        var actionJson = $scope.stepJson.methods[modelIndex].actions = [];

                        var ulElement = $(data.substring(data.indexOf('<ul'), data.indexOf('ul>')));

                        var actionList = ulElement.find('li');

                        if(actionList.length === 0){
                            actionJson[0] = {
                                text: ''
                            };
                        }

                        for(var liIndex= 0, jsonIndex=0; liIndex < actionList.length; liIndex++, ++jsonIndex) {
                            var action = actionList[liIndex];
                            var actionText = action.innerHTML.replace(/^(&nbsp;|\s)*/g, '');
                            actionText = actionText.replace(/(&nbsp;|\s)*$/g, '');

                            actionJson[jsonIndex] = {
                                text: actionText,
                                _id: $(action).attr('db-id') === '' ? undefined: $(action).attr('db-id'),
                                start: $(action).attr('start') === '' ? undefined: $(action).attr('start'),
                                end: $(action).attr('end') === '' ? undefined: $(action).attr('end')
                            };
                        }



/*

                        var actionJson = $scope.stepJson.methods[modelIndex].actions = [],
                            filteredText = data.split(/<li[^>]*db\-id="(.*?)"[^>]*>(&nbsp;|\s)*(.*?)(&nbsp;|\s)*<\/li>/g);
						
						// Add blank action if there are no actions in the list
                        if(filteredText.length <= 3){
                            filteredText.push('', '', '');
                        }


                        for(var textIndex=3, length=filteredText.length, jsonIndex=0; textIndex<length; textIndex+=5, ++jsonIndex) {
                            actionJson[jsonIndex] = {
                                text: filteredText[textIndex]
                            };
                            if(filteredText[textIndex-2] !== 'new'){
                                actionJson[jsonIndex]._id = filteredText[textIndex-2];
                            }
                        }
*/

                    }
                };

                var getFilteredData = function(editor) {
                    var data = editor.getData(),
                        dataHtmlFragment = CKEDITOR.htmlParser.fragment.fromHtml( data );

                    if(editor.filter.applyTo(dataHtmlFragment)) {
                        //data changed by filter
                        var dataHtmlWriter = new CKEDITOR.htmlParser.basicWriter();
                        dataHtmlFragment.writeHtml(dataHtmlWriter);

                        data = dataHtmlWriter.getHtml(dataHtmlWriter);
                    }

                    return data;
                };

                var methodDataChanged = function(editor, modelIndex) {
                    var data = getFilteredData(editor);
                    onMethodModelUpdate(data, modelIndex);
                    startSaveTimer();
                };

                var makeMethodsMovable = function() {
                    var sourceMethodIndex = null;
                    //initialize method dragging
                    $element.find('.itemEditorContainer').movable({
                        maxDepth: 1,
                        listNodeName: 'div',
                        itemNodeName: 'div',
                        rootClass: 'itemEditorContainer',
                        listClass: 'stepContainerChild',
                        itemClass: 'method',
                        placeClass: 'methodPlaceHolder',
                        dragClass: 'methodDragEl',
                        handleClass: 'dd-method-handle',
                        isMethodDrag: true,
                        containment : $element.find('.stepContainerChild'),
                        $parent: $element
                    }).on({
                        'dragStart': function(event, dragStartIndex) {
                            sourceMethodIndex = dragStartIndex;
                            blurCurrentAction();
                            $element.find('.step-container-parent').css('position', 'static');
                        },
                        'change': function(event, dragEndIndex) {
                            $element.find('.step-container-parent').css('position', 'relative');
                            if(sourceMethodIndex !== null && sourceMethodIndex !== dragEndIndex) {
                                $scope.$apply(function() {
                                    //decrementing by 1 because Step Text lies at index 0
                                    --sourceMethodIndex;
                                    --dragEndIndex;

                                    var sourceMethod = $scope.stepJson.methods.splice(sourceMethodIndex, 1);
                                    $scope.stepJson.methods.splice(dragEndIndex, 0, sourceMethod[0]);
                                });

                                startSaveTimer();
                                sourceMethodIndex = null;
                            }
                        }
                    });
                };

                var makeActionsMovable = function(editor) {
                    //initialize action dragging
                    $(editor.element.$).movable({
                        maxDepth: 1,
                        listNodeName: 'ul',
                        rootClass: 'actionListContainer',
                        listClass: 'actionList',
                        itemClass: 'action',
                        placeClass: 'actionPlaceHolder',
                        dragClass: 'actionDragEl',
                        handleClass: 'dd-action-handle',
                        isActionDrag: true,
                        actionButtonContainerClass: 'actionButtonsContainer',
                        $parent: $element,
                        actionButtonHtml: '<div class="actionButtonsContainer pas man">' +
                            '<span class="actionDeleteButton baloo-font baloo-icon-trash"></span>' +
                            '<span class="mls phx baloo-font baloo-icon-gripper-sm"></span>' +
                            '</div>'
                    }).on({
                        'dragStart': function(event) {
                            //stop propagation so that method dragStart event handler does not get triggered
                            event.stopPropagation();

                            blurActionListContainer(this);
                            saveInUndoStack();
                            blurCurrentAction();
                            $(this).parent().find('.buttonContainerList').hide();
                        },
                        'change': function(event, actionIndex) {
                            //stop propagation so that method change event handler does not get triggered
                            event.stopPropagation();

                            var $currentMethod = $(this).parent();
                            $currentMethod.find('.buttonContainerList').show();

                            focusMethod(undefined, $currentMethod, actionIndex);
                            addFocusedClassToMethod($currentMethod);
                            updateActionsTitle($currentMethod);

                            var methodIndex = parseInt(this.getAttribute('editor-index')) - 1;
                            methodDataChanged(editor, methodIndex);
                            saveInUndoStack();
                        }
                    });
                };

                var onWindowClose = function(){
                    $scope.saveUpdatedJSON(false);
                    delayfunc(1000);
                };

                var delayfunc = function(ms) {
                    var start = +new Date;
                    while ((+new Date - start) < ms);
                };

                $(window).on('beforeunload',onWindowClose );

                controllerObject.unbindUndoStackListener = [];

                //CKEDITOR ready event. Fired whenever a new method is added to the editor
                var unbindEditorReadyListener = $rootScope.$on('ckeditor.ready', function(event, editor) {
                    if(!properties.editor)
                        properties.editor = editor;
                    if(editor.element.hasClass('actionListContainer')) {
                        var $method = $(editor.element.$).parent('.method');
                        $method.find('.selectpicker').selectpicker();
                        $method.find('.selectpicker').removeAttr('title');
                        //bind change event for newly added method model
                        $scope.totalMethods++;
                        editor.on('change', function() {
                            var methodIndex = parseInt(editor.element.$.getAttribute('editor-index')) - 1;
                            methodDataChanged(editor, methodIndex);
                        });

                        editor.on('paste', function() {
                            var $currentMethod = $(editor.element.$).parent('.method');
                            $currentMethod.find('li.action').addClass('retain-id');
                            $timeout(function() {
                                $currentMethod.find('li.action').not('.retain-id').removeAttr('db-id');
                                $currentMethod.find('li.retain-id').removeClass('retain-id');
                                updateActionsTitle($currentMethod);
                            });
                        });

                        makeActionsMovable(editor);
                    } else {
/*
                        editor.on( 'key', function( event ) {
                            if ( event.data.keyCode === 13 ) {
                                event.cancel();
                            }
                        });
*/
                        //save change in the step text
                        editor.on('change', function() {
                            $scope.stepJson.text = getFilteredData(editor).split(/^(\s|(&nbsp;))*(.*?)((&nbsp;)|\s)*$/)[3];
                            startSaveTimer();
                        });
                    }

                    editor.document.on('drop', function(event) {
                        event.data.preventDefault(true);
                    });

                    controllerObject.unbindUndoStackListener.push($rootScope.$on('saveInUndoStack', function() {
                        editor.fire('saveSnapshot');
                    }));

                    controllerObject.unbindUndoStackListener.push($rootScope.$on('lockSnapshot', function() {
                        editor.fire('lockSnapshot');
                    }));

                    controllerObject.unbindUndoStackListener.push($rootScope.$on('unlockSnapshot', function() {
                        editor.fire('unlockSnapshot');
                    }));

                    if($scope.totalMethods === $scope.stepJson.methods.length && !$scope.isItemEdtiorInitialised) {
                        $scope.isItemEdtiorInitialised = true;

                        itemEditorInitializeHandler();
                        $scope.onStepEditorInitialise();
                    }
                });

                //Properties and method binded to the DOM
                $scope.sce = $sce;
                $scope.stepText = $scope.stepJson.text;
                $scope.isItemEdtiorInitialised = false;
                $scope.models = [];
                $scope.totalMethods = 0;
                $scope.findPattern = '';
                $scope.replaceText = '';

                $scope.stepTextEditorOptions = {
                    allowedContent: 'b i span font (*){color}[*];',
                    toolbar: [
                        {name: 'groups', items: ['Bold', 'Italic', 'RemoveFormat', 'TextColor']}
                    ],
                    floatingToolbarParentClass:'stepTextHeader',
                    title: '',
                    methodTypes: $scope.methodTypes,
                    uiColor: '#dddddd',
                    $editorContainer: $element
                };

                $scope.methodEditorOptions = {
                    allowedContent: 'ul li span font (*){color}[*];',
                    toolbar: [
                        {name: 'groups', items: ['RemoveFormat', 'TextColor']}
                    ],
                    floatingToolbarParentClass:'methodHeader',
                    title: '',
                    methodTypes: $scope.methodTypes,
                    uiColor: '#dddddd',
                    $editorContainer: $element
                };

                $scope.beforeDeleteStep = function(){
                    properties.stepDeleteInitiated = true;
                    $scope.deleteStep();
                };

                $scope.cancelSave = function(){
                    properties.cancelSaveInitiated = true;
                    $scope.editorClose({isCancel:true});
                };

                $scope.beforeCancelSave = function(event){
                    if(angular.equals(properties.save.originalStepJSON, $scope.stepJson)){
                       $scope.cancelSave();
                    } else{
                        $timeout(function() {
                            $(event.target).next('[alert-modal]').trigger('click');
                        });

                    }
                };



                $scope.deleteStepModalJson = {
                    type : 'warning',
                    title : 'Warning! This cannot be undone',
                    body : {
                        message : 'Are you sure you want to delete this step?'
                    },
                    actionButtons : [{
                        name : 'Cancel'
                        }, {
                            name : 'Delete',
                            callback : $scope.beforeDeleteStep
                        }]
                };

                $scope.cancelSaveModalJson = {
                    type : 'warning',
                    title : 'Warning! This cannot be undone',
                    body : {
                        message : 'Are you sure you wish to discard the changes you just made to this step?'
                    },
                    actionButtons : [{
                        name : 'No'
                    }, {
                        name : 'Yes, Discard Changes',
                        callback : $scope.cancelSave
                    }]
                };
                $scope.methodKeyDown = function(event) {
                    switch(event.keyCode) {
                        case 13:
                            enterKeyPressed(event);
                            break;
                        case 8:
                            backKeyPressed(event);
                            break;
                        case 46:
                            deleteKeyPressed(event);
                            break;
                        case 9:
                            tabKeyPressed(event);
                            break;
                    }
                };

                $scope.itemEditorClickHandler = function(event) {
                    var target= event.target,
                        $targetEl = $(target).closest('.method');
                    $targetEl = $targetEl.length ? $targetEl : $(target).closest('.stepTextDiv');

                    if(!$targetEl.length) {
                        $targetEl = $element.find('.method.focused');
                        $targetEl = $targetEl.length ? $targetEl : $element.find('.stepTextDiv.focused');

                        if($targetEl.length) {
                            $targetEl.addClass('partialFocus');
                        }
                    }
                };

                $scope.toggleFindReplaceBand = function() {
                    var $findReplaceBand = $element.find('#findReplaceBand');
                    if($findReplaceBand.hasClass('visible')) {
                        $element.find('.findReplaceToggleButton').removeClass('fidReplaceBandActive');
                        $findReplaceBand.removeClass('visible');
                        properties.editor.execCommand('removeSearchRange');
                        updateFinderMessage();
                        properties.find.currentFindPattern = null;
                    } else {
                        $element.find('.findReplaceToggleButton').addClass('fidReplaceBandActive');
                        $findReplaceBand.addClass('visible');
                        properties.editor.execCommand('createSearchRange');
                        findOccurrencesIfRequired();
                        $findReplaceBand.find('#findInputBox')[0].focus();
                    }
                };

                $scope.onChangeStep = function(index){
                    $scope.onStepClick({index:index});
                };

                $scope.onSwitchScenarioInEditor = function(){
                    $scope.onSwitchScenario();
                };

                $scope.stepTextFocusHandler = function(event) {
                    addFocusedClassToStepText($(event.currentTarget).parent());
                };

                $scope.methodClickHandler = function(event) {
                    var methodContainer = $(event.currentTarget);

                    if($(event.target).closest('.actionList').length === 0 && !methodContainer.hasClass('focused')) {
                        methodContainer.find('.actionList')[0].focus();
                        focusActionList(methodContainer.find('.actionList')[0], 0);
                    }
                    addFocusedClassToMethod(methodContainer);

                };

                $scope.methodMouseDownHandler = function(event) {
                    var methodContainer = $(event.currentTarget);
                    // Stop mousedown event if the method is already selected and click is outside action list.
                    if($(event.target).closest('.dd-method-handle').length === 0 && $(event.target).closest('.actionList').length === 0 && methodContainer.hasClass('focused')) {
                        stopEventDefault(event);
                    }
                };

                $scope.methodTypeFocusHandler = function(event) {
                    addFocusedClassToMethod($(event.currentTarget).parents('.method'));
                };

                $scope.methodTypeChangeHandler = function() {
                    $timeout(function() {
                        $element.find('.method.focused').find('.selectpicker').removeAttr('title');
                    });
                    startSaveTimer();
                };

                $scope.actionListFocusHandler = function(event) {
                    focusCurrentAction();
                    $timeout(function(){
                        addFocusedClassToMethod($(event.currentTarget).parents('.method'));
                    });
                };

                $scope.actionListBlurHandler = function(event) {
                    var relatedTarget = event.relatedTarget || event.originalEvent.explicitOriginalTarget;
                    if(!(relatedTarget && $(relatedTarget).parent().hasClass('actionButtonsContainer'))) {
                        blurCurrentAction();
                    }
                };

                $scope.actionListKeyDownHandler = function() {
                    focusCurrentAction();
                };

                $scope.actionListMouseUpHandler = function() {
                    focusCurrentAction();
                };

                $scope.insertMethod = function(methodIndex) {
                    properties.newMethod.actions=[{text:''}];
                    if(methodIndex >= 0) {
                        properties.newMethod.type = $scope.stepJson.methods[methodIndex].type;
                        addMethod(methodIndex+1);
                    } else {
                        properties.newMethod.type = $scope.methodTypes[0];
                        addMethod();
                    }

                    startSaveTimer();
                };

                $scope.cloneMethod = function(methodIndex) {
                    properties.newMethod.type = $scope.stepJson.methods[methodIndex].type;
                    properties.newMethod.actions=$scope.stepJson.methods[methodIndex].actions;
                    addMethod(methodIndex + 1);

                    startSaveTimer();
                };

                $scope.displayDeleteMethodMessage = function(event) {
                    var $method = $(event.currentTarget).parents('.method');
                    $method.find('.deleteMethod').show();
                };
                $scope.deleteMethod = function(methodIndex) {
                    var deleteMethod = $scope.stepJson.methods[methodIndex];

                    $scope.stepJson.methods.splice(methodIndex, 1);
                    var lastMethodIndex = --$scope.totalMethods;

                    if(lastMethodIndex === methodIndex && lastMethodIndex !==0) {
                        focusMethod(methodIndex - 1);
                    }
                    else if(lastMethodIndex !== 0) {
                        focusMethod(methodIndex);
                    }

                    if(deleteMethod.primary && $scope.stepJson.methods[0]) {
                        //make first method primary
                        $scope.stepJson.methods[0].primary = true;
                    }

                    startSaveTimer();
                };

                $scope.cancelDelete = function(event) {
                    var $method = $(event.currentTarget).parents('.method');
                    $method.find('.deleteMethod').hide();

                    focusMethod(undefined, $method);
                };

                $scope.updatePrimaryMethod = function(event, methodIndex) {
                    //stop propagation to avoid greying of the method band
                    event.stopPropagation();
                    var methods = $scope.stepJson.methods;
                    if(methods[methodIndex].primary===false){
                        for(var index= 0, length=methods.length; index<length; ++index)
                            methods[index].primary=false;
                        methods[methodIndex].primary=true;
                    }

                    startSaveTimer();
                };

                $scope.deleteButtonClickHandler = function(event) {
                    var deleteButtonContainer = event.currentTarget.parentNode,
                        buttonContainerIndex = getIndex(deleteButtonContainer),
                        currentMethod = deleteButtonContainer.parentNode.parentNode,
                        actionList = currentMethod.getElementsByClassName('actionList')[0],
                        targetAction = actionList.children[buttonContainerIndex];

                    saveInUndoStack();

                    if(actionList.children.length === 1) {
                        targetAction.innerHTML = ' ';
                    } else {
                        actionList.removeChild(targetAction);
                    }

                    updateActionsTitle(actionList);
                    saveInUndoStack();
                    focusActionList(actionList, buttonContainerIndex);
                };

                $scope.addActionClickHandler = function(event) {
                    var methodContainer = event.currentTarget.parentNode;
                    addAction(methodContainer.getElementsByClassName('actionList')[0]);
                };

                $scope.doneButtonClickHandler = function() {
                    $scope.editorClose();

                };

                $scope.saveUpdatedJSON = function(isAutoSave, isCancel){
                    var editorInstances = CKEDITOR.instances;
                    for(var instanceKey in editorInstances) {
                        editorInstances[instanceKey].fire('change');
                    }

                    if(properties.save.timer) {
                        $timeout.cancel(properties.save.timer);
                    }

                    saveEditorChanges(isAutoSave, isCancel);
                };

                $scope.findNextButtonClickHandler = function() {
                    if($scope.findPattern) {
                        findOccurrences();

                        properties.editor.execCommand('findNext', {
                            findPattern: $scope.findPattern,
                            callback: updateFinderMessage,
                            matchCase: $scope.matchCase
                        });
                    }
                };

               /* $scope.findPreviousButtonClickHandler = function() {
                    if($scope.findPattern) {
                        findOccurrences();

                        properties.editor.execCommand('findPrevious', {
                            findPattern: $scope.findPattern,
                            callback: updateFinderMessage
                        });
                    }
                };*/

                $scope.findReplaceButtonClickHandler = function() {
                    if($scope.findPattern) {
                        findOccurrences();

                        properties.editor.execCommand('replace', {
                            findPattern: $scope.findPattern,
                            replaceText: $scope.replaceText,
                            callback: updateFinderMessage,
                            matchCase: $scope.matchCase
                        });
                    }
                };

                $scope.findReplaceAllButtonClickHandler = function() {
                    if($scope.findPattern) {
                        properties.editor.execCommand('replaceAll', {
                            findPattern: $scope.findPattern,
                            replaceText: $scope.replaceText,
                            callback: updateFinderMessage,
                            matchCase: $scope.matchCase
                        });
                        properties.find.currentFindPattern = null;
                    }
                };

                $scope.findAllButtonClickHandler = function() {
                    if($scope.findPattern) {
                        findOccurrences();
                    }
                };

                $scope.$watch('findPattern', function() {
                    findOccurrencesIfRequired();
                });

                $scope.$watch('matchCase', function() {
                    findOccurrences(true);
                });

                //Watch Change in methodTypes
                $scope.$watch('methodTypes',function(newVal,oldVal){
                    $timeout(function(){
                        $element.find('.selectpicker').selectpicker('refresh');
                    });
                },true);

                $scope.$on('$destroy', function(event) {
                    //$scope = null;
                    unbindEditorReadyListener();
                    while(controllerObject.unbindUndoStackListener.length > 0){
                        controllerObject.unbindUndoStackListener.pop()();
                    }

                    var editorInstances = CKEDITOR.instances;
                    var destroyFunction;
                    for(var instanceKey in editorInstances) {
                        destroyFunction = $(editorInstances[instanceKey].element.$).data('movable-destroy');
                        if(destroyFunction)
                            destroyFunction();
                    }

                    $(window).off('beforeunload', onWindowClose);

                    //save step before navigating to any other page. dont save if navigation is triggered by delete step
                    if(!properties.stepDeleteInitiated  && ! properties.cancelSaveInitiated) {
                        $scope.saveUpdatedJSON(false);
                    }

                    if(properties.cancelSaveInitiated){
                        $scope.saveUpdatedJSON(false, true);
                    }

                    $element.find('.itemEditorContainer').data('movable-destroy')();

                    $(document).off('keydown', controllerObject.tabKeyHandler);
                    $(window).off('resize', controllerObject.updateStepContainerHeight);
                    $(window).off('resize', controllerObject.setHiddenContainerDimensions);
                });

            },
            link: function(scope, element, attrs, requiredControllers) {
                var controller = requiredControllers[0];
                //bind events for adjusting height of the editor window
                controller.updateStepContainerHeight();
                controller.setHiddenContainerDimensions();
                element.find('#findReplaceBand').on('transitionend webkitTransitionEnd', controller.updateStepContainerHeight);
                $(window).on('resize', controller.updateStepContainerHeight);
                $(window).on('resize', controller.setHiddenContainerDimensions);

                //todo revisit the handler when integrating in the project
                //tab key handler to focus on the editor when it is greyed out
                $(document).on('keydown', controller.tabKeyHandler);

            }
        };
    }]];

});
