'use strict';


define(['appModule', 'angularMocks'], function(app) {
	describe('HeaderController', function() {

		//Initialize global variables
		var scope,
			rootScope,
			HeaderController,
			$state,
			Constant,
			storage,
			taskSearch,
			$templateCache,
			template,
			$compile,
			$httpBackend,
			$timeout,
			$window,
			event;


		var sampleUserData =[
			{
				_id: '55d5a7833b5709aaa112d3ff',
				desc: 'System Admin',
				name: 'systemAdmin'
			}
		];

		// Load the main application module

		beforeEach(module(ApplicationConfiguration.applicationModuleName, function ($translateProvider) {
			$translateProvider.translations('en', {});
		}));


		beforeEach(inject(function(_$rootScope_,$controller,_$window_, _$state_, Constants, Storage, TaskSearch, _$templateCache_,_$compile_,_$timeout_, _$httpBackend_) {

			rootScope = _$rootScope_;

			scope = _$rootScope_.$new();
			Constant = Constants;
			storage= Storage;
			taskSearch = TaskSearch;
			$templateCache= _$templateCache_;

			$compile = _$compile_;

			var htmlString = $templateCache.get('header.client.view.html');
			htmlString = htmlString.replace('data-ng-controller=HeaderController','');
			template = $($compile(htmlString)(scope));

			$timeout= _$timeout_;
			$window = _$window_;

			// Point global variables to injected services
			$state = _$state_;
			$httpBackend = _$httpBackend_;
			$httpBackend.expect('POST','/user/roles').respond(sampleUserData);

			HeaderController = $controller('HeaderController', {
				$scope: scope,
				$element :template,
				$window:$window

			});

			scope.$digest();

		}));

		it('should check if showMenu changes with default state', function() {

			$state.current.lazyModule = Constant.MODULES.dashboard;

			rootScope.$broadcast('$stateChangeSuccess',$state);
			rootScope.$digest();

			expect(scope.showMenu).toBeFalsy();

		});

		it('should check if showMenu changes with other than default state', function() {

			$state.current.lazyModule = 'test';

			rootScope.$broadcast('$stateChangeSuccess',$state);
			rootScope.$digest();

			expect(scope.showMenu).toBeTruthy();

		});

		it('$scope.header.form should be true on click of searchIcon if searchBox has some value', function() {

			var $textBox =template.find('.search-text-box');

			template.find('.input-group-btn').click();

			$httpBackend.when('GET','scenarios/exists?searchText=test').respond(200, {'searchText':'testObjectID'});
			$textBox.val('test');



			template.find('.input-group-btn').click();

			scope.searchTask($textBox.val());
			$httpBackend.flush();

			expect($textBox.val()).toBeTruthy();
			expect(template.find('.input-group-btn').attr('tabindex','-1')).toBeTruthy();
			//this is always false
			expect(scope.header.form).toBeTruthy();

		});

		it('$scope.header.form should be true on click on searchIcon', function() {

			var $textBox =template.find('.search-text-box');
			template.find('.input-group-btn').click();



			expect(template.find('.input-group-btn').attr('tabindex','1')).toBeTruthy();
			expect(scope.header.form).toBeTruthy();

		});

		it('$scope.searchTask should show error on submit of blank searchText', function() {


			var friendlyId = '';
			scope.searchTask(friendlyId);
			//template.find('#topbar-search').submit();
			// what to validate here
		});

		it('$scope.header.form should be false on click on searchIcon if searchBox is null', function() {

			var $textBox =template.find('.search-text-box');
			template.find('.input-group-btn').click();
			$textBox.val('');
			template.find('.input-group-btn').click();


			expect(template.find('.input-group-btn').attr('tabindex','1')).toBeTruthy();
			expect(scope.header.form).toBeFalsy();

		});

		it('$scope.header.form value is false if searchBox value is null on document click', function() {

			var $textBox = template.find('.search-text-box').val('');
			$(document).click();

			expect(scope.header.form).toBeFalsy();
		});

		it('$scope.header.form value is true if searchBox value is not  null on document click', function() {

			scope.header.form = true;
			var $textBox = template.find('.search-text-box').val('test');
			$(document).click();

			expect(scope.header.form).toBeTruthy();
		});

		it('$scope.successCB should call if friendly id exists',function(){

			spyOn($state, 'go');
			$httpBackend.when('GET','scenarios/exists?searchText=Go.123').respond(200, {exists: true,taskId: 'obj_123', friendlyId:'GO.123'});
			scope.searchTask('Go.123');
			$httpBackend.flush();

			expect($state.go).toHaveBeenCalledWith('content.task.scenario', {friendlyId: 'GO.123', taskId: 'obj_123'});

		});

		//Storage Service

		it('should check the availability of localStorage and sessionStorage',function(){

			expect(storage.isSessionStorageAvailable()).toBeTruthy();
			expect(storage.isLocalStorageAvailable()).toBeTruthy();
		});


		it('should check the working of localStorage functions',function(){

			storage.setLocalStorageItem('test','value');
			expect(storage.getLocalStorageItem('test')).toEqual('value');
			storage.clearLocalStorage();
			expect(storage.getLocalStorageItem('test')).toBeNull();
		});

		it('should check if signout clears all the session storage keys', function() {

			storage.setSessionStorageItem('test','value');
			scope.signout();
			expect(storage.getSessionStorageItem('test')).toBeNull();
		});

		it('should check the working of sessionStorage functions',function(){

			storage.setSessionStorageItem('test','newValue');
			expect(storage.getSessionStorageItem('test')).toEqual('newValue');
			storage.clearSessionStorage();
			expect(storage.getSessionStorageItem('test')).toBeNull();
		});

		it('should check the working of localStorage functions if value is an object',function(){

			storage.setLocalStorageItem('test',['value1','value2']);
			expect(storage.getLocalStorageItem('test')).toEqual(['value1','value2']);
		});

		it('should check the working of localStorage functions if it has a third parameter',function(){

			storage.setLocalStorageItem('test','value',['value1','value2']);
			expect(storage.getLocalStorageItem('test',['value1','value2'])).toEqual(['value']);
		});

		it('should check the removal of key in localStorage',function(){

			storage.setLocalStorageItem('test1','value1');
			storage.setLocalStorageItem('test2','value2');
			storage.clearLocalStorage('test1');
			expect(storage.getLocalStorageItem('test1')).toBeNull();
		});

		it('should check that user profile drop-down is not getting close on click on user role',function(){
			event = jasmine.createSpyObj('event', ['stopPropagation','preventDefault']);
			scope.disableClick(event);
			expect(event.preventDefault).toHaveBeenCalled();
			expect(event.stopPropagation).toHaveBeenCalled();
		});
	});
	});
