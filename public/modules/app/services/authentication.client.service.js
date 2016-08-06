'use strict';

// Authentication service for user variables
define ([

], function() {

	return ['Authentication', [
		function() {
			var _this = this;

			_this._data = {
				user: window.user
			};
			return _this._data;
		}
	]];
});
