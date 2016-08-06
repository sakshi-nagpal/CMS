'use strict';

define([], function () {
    return ['scenarioReference', ['$compile', '$templateCache', 'ScenarioReferenceService', '$timeout', '$filter', function ($compile, $templateCache, ScenarioReferenceService, $timeout, $filter) {

        function link(scope, element) {
            var $modalParent = element.parent();
            $modalParent.append($compile($templateCache.get('scenarioReference.client.directive.html'))(scope));

            element.bind('click', function () {
                scope.tmp = {};
                ScenarioReferenceService.get(scope.projectData._id, function (data) {
                    scope.data = data;
                    scope.indicators.forEach(function (indicator) {
                        if (!($filter('filter')(scope.data.projectContentRef, {'type': indicator}).length)) {
                            scope.data.projectContentRef.push({type: indicator});
                        }
                    });

                    $modalParent.find('.scenario-reference').modal('show');
                });
            });

            scope.startsWith = function (actual, expected) {
                var lowerStr = (actual + "").toLowerCase();
                return lowerStr.indexOf(expected.toLowerCase()) === 0;
            };

            scope.searchBoxClickHandler = function(event) {
                var $isOpen = $(event.currentTarget).parent().hasClass('open');
                if($(event.target).hasClass('caret')) {
                    if(!$isOpen) {
                        $(event.currentTarget).find('.search-box').focus();
                    }
                }
                  else if($isOpen) {
                      event.stopPropagation();
                  }
            };

            scope.updateScenarioRefModel = function(ref, indicator) {
                var obj = $filter('filter')(scope.data.projectContentRef, {'type': indicator})[0];
                obj.scenario_ref = {};
                obj.scenario_ref.reference_id = ref.reference_id;
                obj.scenario_ref.reference_name = ref.reference_name;
            };

            scope.scenarioRefModelClickHandler = function() {
                scope.indicators.forEach(function (indicator, i) {
                    var obj = $filter('filter')(scope.data.projectContentRef, {'type': indicator})[0];
                    if(obj.scenario_ref && obj.scenario_ref.reference_id.length && scope.tmp[indicator] && !scope.tmp[indicator].isRefNameInputBoxVisible) {
                        obj.scenario_ref.reference_id = '';

                    }
                });

            };

            scope.listKeydownHandler = function(e) {
                if(e.which === 40) {
                    $(e.currentTarget).parent().find('.vertical-navigation').first().focus();
                }
                else if (e.which === 13) {
                    e.preventDefault();
                }
            };

            scope.updateScenarioReference = function () {
                var tmpArray = [];
                scope.indicators.forEach(function (indicator, i) {
                    var obj = $filter('filter')(scope.data.projectContentRef, {'type': indicator})[0];

                    if (obj.scenario_ref || obj.doc_name) {
                        if(obj.scenario_ref && !obj.scenario_ref.reference_id) { //In case doc_name exists and scenario_ref does not
                            delete obj.scenario_ref;
                        }
                        tmpArray.push(obj);
                    }
                });

                ScenarioReferenceService.post(scope.projectData._id, tmpArray);
                $modalParent.find('.scenario-reference').modal('hide');
            };

            $timeout(function () {
             $modalParent.find('.selectpicker').selectpicker();
             });
        }

        return {
            restrict: 'A',
            link: link,
            scope: {
                projectData: '=',
                indicators: '='
            }
        };
    }]
    ];
});
