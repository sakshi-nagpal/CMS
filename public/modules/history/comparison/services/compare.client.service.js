'use strict';
define([], function () {
    return ['Compare', ['JsonDiffCalculator',function (calculateJsonDiff) {

        function comparatorClass(sampleCompConfig) {

            //var configValidityInfo = CompareConfigValidator(sampleCompConfig);
            //
            //if(configValidityInfo !== true) {
            //    throw new TypeError("The configuration passed for sample comparison is not valid. The error probably is: "
            //    + configValidityInfo);
            //}

            this.sampleCompConfig = sampleCompConfig;

            return this;
        }

        comparatorClass.prototype.compare = function(sample1, sample2) {
            //sample1 = CloneUtil(sample1);
            //sample2 = CloneUtil(sample2);

            this.finalOutputDiffJson = Object.create(null);

            this.finalOutputDiffJson = calculateJsonDiff.call(this, sample1, sample2, this.sampleCompConfig, this.finalOutputDiffJson, "root", 0);

            return this.finalOutputDiffJson;
        };

        return comparatorClass;

    }]];
});
