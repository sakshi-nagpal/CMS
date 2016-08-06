'use strict';

define([

], function() {
    return ['ScenarioPhaseAuthorization', [function() {
        var _this = this;
        _this.phases = window.phases;
        return {
            isScenarioPhaseEditable: function(scenarioPhase){
                var isScenarioPhaseEditable = false;
                phases.filter(function(n){
                    if(n.code === scenarioPhase){
                        isScenarioPhaseEditable = n.editable;
                    }
                });
                return isScenarioPhaseEditable;
            },
            phases: _this.phases
        };
    }]];
});
