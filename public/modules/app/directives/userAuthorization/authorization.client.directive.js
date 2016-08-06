'use strict';

define([], function() {
	return ['userCan',['Authorization','$animate', function(Authorization, $animate) {
		return {
			transclude: 'element',
			priority: 570,
			terminal: true,
			restrict: 'A',

			link: function($rootScope, $element, $attr, ctrl, $transclude) {

				$attr.$observe('userCan', function (capability) {
					if (Authorization.canAccess(capability)) {
							$transclude(function (clone) {
								$animate.enter(clone, $element.parent(), $element);
							});
					}
				});
			}
		};
	}]];
});
