'use strict';

define([
    'ckEditor'
   // '../../../../common/util/movable'
], function() {
    return ['ckeditor', ['$timeout', '$q', '$rootScope',function ($timeout, $q, $rootScope) {
        CKEDITOR.disableAutoInline = true;

        var $defer = $q.defer(),
            loaded;

        function checkLoaded() {
            if (CKEDITOR.status === 'loaded') {
                loaded = true;
                $defer.resolve();
            } else {
                $timeout(checkLoaded, 10);
            }
        }
        $timeout(checkLoaded, 100);

        return {
            restrict: 'AC',
            require: ['ngModel', '^?form'],
            scope: false,
            link: function (scope, element, attrs, ctrls) {
                var ngModel = ctrls[0];
                var form = ctrls[1] || null;
                var EMPTY_HTML = '<ul class="actionList"><li class="action action1"> </li></ul>',
                    isTextarea = element[0].tagName.toLowerCase() === 'textarea',
                    data = [],
                    isReady = false;

                if (!isTextarea) {
                    element.attr('contenteditable', true);
                }

                var onLoad = function () {
                    var options = {
                        toolbar: 'full',
                        toolbar_full: [ //jshint ignore:line
                            { name: 'basicstyles',
                                items: [ 'Bold', 'Italic', 'Strike', 'Underline' ] },
                            { name: 'paragraph', items: [ 'BulletedList', 'NumberedList', 'Blockquote' ] },
                            { name: 'editing', items: ['JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock' ] },
                            { name: 'links', items: [ 'Link', 'Unlink', 'Anchor' ] },
                            { name: 'tools', items: [ 'SpellChecker', 'Maximize' ] },
                            '/',
                            { name: 'styles', items: [ 'Format', 'FontSize', 'TextColor', 'PasteText', 'PasteFromWord', 'RemoveFormat' ] },
                            { name: 'insert', items: [ 'Image', 'Table', 'SpecialChar' ] },
                            { name: 'forms', items: [ 'Outdent', 'Indent' ] },
                            { name: 'clipboard', items: [ 'Undo', 'Redo' ] },
                            { name: 'document', items: [ 'PageBreak', 'Source' ] }
                        ],
                        disableNativeSpellChecker: false,
                        uiColor: '#FAFAFA',
                        height: '400px',
                        width: '100%'
                    };
                    options = angular.extend(options, scope[attrs.ckeditor]);

                    //remove the html comments added by angularjs, to avoid CKEditor issues
                    element.html(element.html().replace(/<!--(.*?)-->/g, ""));

                    var instance = (isTextarea) ? CKEDITOR.replace(element[0], options) : CKEDITOR.inline(element[0], options),
                        configLoaderDef = $q.defer();

                    element.bind('$destroy', function () {
                        instance.destroy(
                            false //If the instance is replacing a DOM element, this parameter indicates whether or not to update the element with the instance contents.
                        );
                    });
                    /*var setModelData = function (setPristine) {
                        var data = instance.getData();
                        if (data === '') {
                            data = null;
                        }
                        $timeout(function () { // for key up event
                            if (setPristine !== true || data !== ngModel.$viewValue)
                                ngModel.$setViewValue(data);

                            if (setPristine === true && form)
                                form.$setPristine();
                        }, 0);
                    }, onUpdateModelData = function (setPristine) {
                        if (!data.length) {
                            return;
                        }

                        var item = data.pop() || EMPTY_HTML;

                        isReady = false;
                        instance.setData(item, function () {
                            setModelData(setPristine);
                            isReady = true;
                        });
                    };*/

                    //instance.on('pasteState',   setModelData);
                   // instance.on('change', setModelData);
                   // instance.on('blur', setModelData);
                    //instance.on('key',          setModelData); // for source view

                    instance.on('instanceReady', function (event) {
                        //self made change
                        $rootScope.$emit('ckeditor.ready', event.editor);
                        //scope.$broadcast('ckeditor.ready');

                        scope.$apply(function () {
                            if (!instance.getData()) {
                                //if no data is available on the editor
                                if (ngModel.$viewValue) {
                                    //set ngModelValue
                                    data.push(ngModel.$viewValue);
                                } else {
                                    //set the default html as editor data i.e. EMPTY_HTML
                                    data.push(EMPTY_HTML);
                                }
                            }

                            //onUpdateModelData(true);
                            instance.resetUndo();
                        });

                       // instance.document.on('keyup', setModelData);
                    });
                    instance.on('customConfigLoaded', function () {
                        configLoaderDef.resolve();
                    });

                    ngModel.$render = function () {
                        data.push(ngModel.$viewValue);
                        if (isReady) {
                            //onUpdateModelData();
                        }
                    };
                };

                if (CKEDITOR.status === 'loaded') {
                    loaded = true;
                }
                if (loaded) {
                    $timeout(onLoad);
                    //onLoad();
                } else {
                    $defer.promise.then(function() {
                        $timeout(onLoad);
                        //onLoad();
                    });
                }
            }
        };
    }]];
});
