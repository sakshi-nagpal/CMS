'use strict';

// Users service used for communicating with the users REST endpoint
define ([], function() {

	return['Users', ['$resource',
		function($resource) {
			return $resource('users', {}, {
				update: {
					method: 'PUT'
				}
			});
		}
	]];
});
