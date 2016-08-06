'use strict';

define ([
], function() {

	return ['DashboardController',['$scope', '$element', '$timeout', '$templateCache', '$compile', 'Catalogs',
		'Storage','TaskSearch','Products','$filter','$state',
		function ($scope, $element, $timeout, $templateCache, $compile, Catalogs, Storage,TaskSearch, Products,
				  $filter,$state) {

			/* repaint carousel template */
			$scope.$watch(function() {
				return $scope.selectedCatalog;
			}, function(newValue, oldValue) {

				var tpl = $templateCache.get('carousel.client.view.html');
				var compiled = $compile(tpl)($scope);
				$element.find('#series-carousel').html(compiled);
				$element.find('#carousel-items').css('opacity','0');
				$timeout(createCarousel,0);
			});

			var createCarousel = function(){

				$element.find('#carousel-items').owlCarousel({
					items: 4,
					navigation:true,
					navigationText: [
						'<i class="fa fa-chevron-left text-large"></i>',
						'<i class="fa fa-chevron-right text-large"></i>'
					]
				}).css('opacity','1');
				$element.find('.thumbnail').removeClass('pull-left');
				$element.find('.selectpicker').removeAttr('title');

			};

			//json of catalogs
			Catalogs.query(function(catalogs) {
                $scope.catalogs = catalogs;

				//refresh scenario with already selected version
				if(!Storage.getSessionStorageItem('dashboard.selectedCatalog'))
                	$scope.selectedCatalog=$scope.catalogs[0];
				else{
					$scope.selectedCatalog=$scope.catalogs[parseInt(Storage.getSessionStorageItem('dashboard.selectedCatalog'))];
				}
				$element.find('#carousel-items').css('opacity','0');
				$scope.$emit('hideLoader');
				$element.find('.resources').removeClass('hide');
                $timeout(function(){
                    createCarousel();
					$element.find('.selectpicker').selectpicker();
					$element.find('.bootstrap-select .btn').attr('tabindex', 0);
				},0);
            });
			$scope.launchState = function(data){
				$state.go('skill.browse.1', {app:data});
			};
			//add currentSelectedVersion to sessionStorage to persist state on stateChange
			$scope.onVersionChange = function(){
				try{
					Storage.setSessionStorageItem('dashboard.selectedCatalog',$scope.catalogs.indexOf($scope.selectedCatalog));
				}catch(e){
					console.log(e);
				}

			};
			$scope.addFocus = function(event){
				event.currentTarget.focus();
			};

			$scope.successCB = function(){
				$scope.taskSearchText = null;
			};

			$scope.searchTask=function(taskSearchText){
				TaskSearch.checkIfFriendlyIdExists(taskSearchText,$scope.successCB);
			};

		}]];

});



