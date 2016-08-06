'use strict';

var Comparator = (function() {

	var	COMP_ENGINE_CONST = require('./comparator-engine-const'),
		cloneUtil = require('./clone-util'),
		compConfigValidator = require('./comp-config-validator'),
		calculateJsonDiff = require('./json-diff-calculator'),
		logger = require('../util/logger');

	function comparatorClass(sampleCompConfig) {

		var configValidityInfo = compConfigValidator(sampleCompConfig);

		if(configValidityInfo !== true) {
			throw new TypeError("The configuration passed for sample comparison is not valid. The error probably is: "
			+ configValidityInfo);
		}

		// TODO - How about one million attributes in JSON

		this.sampleCompConfig = sampleCompConfig;

		return this;
	}

	comparatorClass.prototype.compare = function(sample1, sample2) {
		sample1 = cloneUtil(sample1);
		sample2 = cloneUtil(sample2);

		this.finalOutputDiffJson = Object.create(null);

		this.finalOutputDiffJson = calculateJsonDiff.call(this, sample1, sample2, this.sampleCompConfig, this.finalOutputDiffJson, "root", 0);

		return this.finalOutputDiffJson;
	};

	return comparatorClass;

})();

module.exports = Comparator;