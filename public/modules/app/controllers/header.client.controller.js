'use strict';


define ([
], function() {


	return ['HeaderController',['$scope', '$state','$element','Constants','Storage','$window','$http','TaskSearch','Role','$rootScope',
		function ($scope, $state, $element,Constants,Storage,$window,$http,TaskSearch,Role,$rootScope) {
			$scope.showMenu = false;
			$scope.header = {
				form: false,
				layout_horizontal_menu:'',

				toggle: function(k,event){ //opening and closing of search box
					switch(k){
						case 'form':
							if($(event.currentTarget).parents('#topbar-search').hasClass('open')){

								var $textBox = $element.find('.search-text-box');
								if ($textBox.val()){
									$scope.searchTask($textBox.val());
									$scope.header.form = true;
									$element.find('.search-text-box').attr('tabindex',1);
									$element.find('.input-group-btn').attr('tabindex',-1);
								}
								else{
									$element.find('.search-text-box').attr('tabindex',-1);
									$element.find('.input-group-btn').attr('tabindex',1);
								}
							}
							else{
								$element.find('.search-text-box').focus();
								$element.find('.search-text-box').attr('tabindex',1);
								$element.find('.input-group-btn').attr('tabindex',-1);
							}
							event.stopPropagation();
							break;
					}
				}
			};

			Role.roleDescByRoleName.query({},{roles:$rootScope.authentication.user.roles},
				function(roles){
					$scope.userRoles = roles;
				});


			//collapse search box if clicked anywhere else in window
			angular.element(document).on('click', function(event){

					var $textBox = $element.find('.search-text-box');
					var $textBoxParent = $element.find('#topbar-search');
					if($textBox.val()==='' && $textBoxParent.hasClass('open')){
						$scope.header.form = false;
						$element.find('.search-text-box').attr('tabindex',-1);
						$element.find('.input-group-btn').attr('tabindex',1);
						$scope.$digest();
					}

			});

			$scope.header.header_topbar = 'horizontal-menu-page';
			$scope.header.layout_horizontal_menu = 'horizontal-menu hidden-sm hidden-xs';

			//to show or hide menu based on current module selection
			$scope.$on('$stateChangeSuccess', function() {
    			if($state.current.lazyModule === Constants.MODULES.dashboard){
					$scope.showMenu = false;
					$element.find('.logo-container').blur().removeClass('cursor-pointer').addClass('cursor-default').attr('tabindex', -1).css('pointer-events', 'none');
				}
				else{
					$scope.showMenu = true;
					$element.find('.logo-container').removeClass('cursor-default').addClass('cursor-pointer').attr('tabindex', 1).css('pointer-events', 'auto');
				}

			});

			$scope.disableClick = function(event){
				event.preventDefault();
				event.stopPropagation();
			};

			$scope.signout = function(){
				Storage.clearSessionStorage();
				//$window.location = '/auth/signout';
			};

			$scope.successCB = function(){
				var $textBox = $element.find('.search-text-box');
				$textBox.val('').blur();
				$scope.taskSearchText = null;
				$scope.header.form = false;
				$element.find('.search-text-box').attr('tabindex',-1);
				$element.find('.input-group-btn').attr('tabindex',1);
			};

			$scope.searchTask=function(taskSearchText){
				if($element.find('#topbar-search').hasClass('open') || !$element.find('#topbar-search').hasClass('open-add')){ // to stop showing notification when open with keyboard
					TaskSearch.checkIfFriendlyIdExists(taskSearchText,$scope.successCB);
				}
			};

		}]];

}

);
