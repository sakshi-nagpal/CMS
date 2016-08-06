
'use strict';

define(['skillTaggingModule', 'angularMocks'], function () {
    describe('Testing UI Data Grid', function () {
        var $compile,
            $rootScope,
            $state,
            element,
            $scope,
            $controller,
            $document,
            $timeout,
            ReSizer;

        var sampleSkillData = [
            {
                skillId : 'skill_1',
                category: 'category_1',
                SubCategory: 'sub-category_1'
            },
            {
                skillId : 'skill_2',
                category: 'category_2',
                SubCategory: 'sub-category_2'
            }
        ];

        var sampleSelectedData =[
            {
                skillId : 'skill_2',
                category: 'category_2',
                SubCategory: 'sub-category_2'
            }
        ];

        var error = {
            noData:'No Skills Available',
            noResults:'No Search Results Found'
        };

        var firstOption = {id:"All",label:"AAA", value:"All"};
        var sampleSearchOptions = [
            {
                _id:'1',
                'title':'app1',
                'id':'app1',
                'label':'app1',
                'value':'app1',
                'parent' :null,
                'children':[
                    {
                        _id:'11',
                        'title':'app11',
                        'parent' :'1'
                    },
                    {
                        _id:'12',
                        'title':'app12',
                        'parent' :'1'
                    }
                ]
            },
            {
                _id:'2',
                'title':'app2',
                'id':'app2',
                'label':'app2',
                'value':'app2',
                'parent' :null,
                'children':[
                    {
                        _id:'21',
                        'title':'app21',
                        'parent' :'2'
                    },
                    {
                        _id:'22',
                        'title':'app22',
                        'parent' :'2'
                    },{
                        _id:'23',
                        'title':'app23',
                        'parent' :'2'
                    }
                ]
            }
        ];

        var columns = [
            {
                field: 'category',
                displayName: 'Categories',
                width: '30%',
                searchConfig:{
                    type: 'dropdown',
                    dependentCols:[1],
                    options: sampleSearchOptions
                }
            },
            {
                field: 'subCategory',
                displayName: 'Sub - Categories',
                width: '30%'
            },
            {
                field: 'skillId',
                displayName: 'Button',
                width: '20%',
                showCount :true,
                enableSorting :false,
                searchConfig:{
                    type: 'dropdown',
                    options: []
                },
                cellTemplate: [
                    {
                        type: 'button',
                        staticDisplayName: 'TAG',
                        callback: 'buttonCallback',
                        className: 'buttonClassName'
                    }
                ]
            },
            {
                field: ' ',
                displayName: 'Link',
                width: '20%',
                enableSorting :false,
                searchConfig: {
                    type: 'textSearch',
                    placeholderText : 'Search'
                },
                cellTemplate: [
                    {
                        type: 'link',
                        field: 'skillId',
                        className: 'linkClassName',
                        href :'link'
                    },
                    {
                        type: 'html',
                        template: '<div></div>',
                        callback: 'Callback'
                    },
                    {
                        type : 'ng-repeat',
                        template : '<label ng-repeat="app in [2013 , 2016]">{{app}}</label>'
                    }

                ]
            }
        ];


        var sampleGridOptions =
        {
            data:{
                sourceData :sampleSkillData,
                selectedData : sampleSelectedData,
                uniqueId :'skillId'
            },
            title: 'Dummy title',
            searchConfig: {
                title : "Sample Search for",
                placeholderText :  "Sample Placeholder Text",
                index : {},
                indexedColumns : ['skillId', 'category']
            },
            rowHeight: 40,
            fixedHeight :50,
            callback: 'rowCallback',
            multiSelect: true,
            columns : columns
        };


        // Load the main application module
        beforeEach(module(ApplicationConfiguration.applicationModuleName, function ($translateProvider) {
            $translateProvider.translations('en', {});
        }));

        beforeEach(inject(function (_$compile_, _$rootScope_, _$state_,_$document_, _$timeout_,reSizer) {

            // The injector unwraps the underscores (_) from around the parameter names when matching
            $compile = _$compile_;
            $rootScope = _$rootScope_;
            $state = _$state_;
            $scope = _$rootScope_.$new();
            $document = _$document_;
            $timeout = _$timeout_;
            ReSizer = reSizer;
            $scope.gridConfig = {};
            $scope.data= {filterValue : ''};
            $scope.gridConfig.columns = [];
            $scope.onColumnFilter=function(index,options){};


            angular.copy(sampleGridOptions, $scope.gridConfig);

            $scope.tagSkill = function(data, isSelected) {};


            element = angular.element('<ui-data-grid row-callback="tagSkill(data, isSelected)" button-callback="buttonCallBack(data)" on-column-filter="onColumnFilter(index,options)" link-callback="linkCallBack(data)" grid-config="gridConfig"></ui-data-grid>');
            element = $compile(element)($scope);
            $scope.$apply();
            $controller = element.controller('uiDataGrid');

            $scope = element.isolateScope();
            $document.find('body').append(element);
            $timeout.flush();

        }));
        it('should check scope variables ', function(){
            expect($scope.searchEnabled).not.toBeNull();
            expect($scope.selections.length).toEqual(1);
            expect($scope.data.filterValue).toEqual('');
            expect($scope.errorMessage).toBeNull();
            expect($scope.gridConfig.data.selectedData).not.toBeNull();
            expect($scope.gridConfig.columns).not.toBeNull();
            expect($scope.gridTitle).toEqual($scope.gridConfig.title);
        });


        it('check working of reSizer Service', function () {
            ReSizer.getUpdatedHeight();
            expect(ReSizer.getUpdatedHeight()).not.toBeNull();

            $scope.ReSizer =ReSizer;
            $(window).resize();
            $timeout.flush();
            $(window).resize();
        });

        it('should trigger the Element Click and then its Callback', function(){

            spyOn($scope, 'onElementClick').and.callThrough();
            spyOn($scope, 'buttonCallback').and.callThrough();
            var btn = element.find('.buttonClassName').eq(0);
            btn.click();
            expect($scope.onElementClick).toHaveBeenCalled();
            expect($scope.buttonCallback).toHaveBeenCalled();


        });

        it('should not return on Element Click if there is no Callback', function(){
            spyOn($scope, 'onElementClick').and.callThrough();
            spyOn($scope, 'linkCallback').and.callThrough();

            var link = element.find('.linkClassName').eq(0);
            link.click();

            expect($scope.onElementClick).toHaveBeenCalled();
            expect($scope.linkCallback).not.toHaveBeenCalled();
        });

        it('Search will be disabled if there is no Search Config ', inject(function (_$compile_){


            $scope.gridConfig ={};
            $scope.gridConfig.columns = [];
            angular.copy(sampleGridOptions, $scope.gridConfig);
            $scope.gridConfig.searchConfig = null;

            //again calling the controller function
            element = angular.element('<ui-data-grid row-callback="tagSkill(data, isSelected)" button-callback="buttonCallBack(data)" link-callback="linkCallBack(data)" grid-config="gridConfig"></ui-data-grid>');
            element = _$compile_(element)($scope);
            $scope.$apply();
            $scope = element.isolateScope();

            var searchbox =  element.find('.search-box').outerHeight();
            $timeout.flush();

            expect($scope.searchEnabled).toBeFalsy();
            expect($scope.errorMessage).toBeNull();
            expect(searchbox).toBeNull();


        }));

        it('should check error message if there is no data', inject(function (_$compile_){


            $scope.gridConfig.columns = [];
            $scope.gridConfig.columns = columns;
            $scope.gridConfig.data.sourceData = [];

            //again calling the controller function
            element = angular.element('<ui-data-grid row-callback="tagSkill(data, isSelected)" button-callback="buttonCallBack(data)" link-callback="linkCallBack(data)" grid-config="gridConfig"></ui-data-grid>');
            element = _$compile_(element)($scope);
            $scope.$apply();
            $scope = element.isolateScope();

            expect($scope.errorMessage).toEqual(error.noData);

        }));

        it('should check error message if there is  data', inject(function (_$compile_){


            angular.copy(sampleGridOptions, $scope.gridConfig);

            //again calling the controller function
            element = angular.element('<ui-data-grid row-callback="tagSkill(data, isSelected)" button-callback="buttonCallBack(data)" link-callback="linkCallBack(data)" grid-config="gridConfig"></ui-data-grid>');
            element = _$compile_(element)($scope);
            $scope.$apply();
            $scope = element.isolateScope();

            expect($scope.errorMessage).toEqual(error.noResults);

        }));
        it('should show error msg if there is no resultCount ', inject(function (_$compile_){
            $scope.gridConfig.columns = [];
            $scope.gridConfig.columns = columns;
            $scope.gridConfig.data.sourceData = [];
            element = angular.element('<ui-data-grid row-callback="tagSkill(data, isSelected)" button-callback="buttonCallBack(data)" link-callback="linkCallBack(data)" grid-config="gridConfig"></ui-data-grid>');
            element = _$compile_(element)($scope);
            $scope.$apply();
            $scope = element.isolateScope();
            $scope.updateResultCount();
            $timeout.flush();
            expect($scope.errorMessage).toEqual(error.noResults);

        }));

        it('should  clear the text on $scope.clearText', function(){

            $scope.clearText();
            expect($scope.data.filterValue).toEqual('');
        });

        it('should call onColumnFilter on changing the value of dropdown',function(){
            $scope.$broadcast('columnFilterChange',{columnIndex:0, options: sampleSearchOptions});
            $timeout.flush();
            spyOn($scope, 'onColumnFilter').and.callThrough();
            $scope.onDropdownChange(0,sampleSearchOptions[0],sampleSearchOptions[0].id);
            expect($scope.onColumnFilter).toHaveBeenCalled();
        });

        it('should update the result Count on again dropDown Change on changing the value of dropdown',function(){
            spyOn($scope, 'updateResultCount').and.callThrough();
            //spyOn($scope, 'removeFilter').and.callThrough();
            $scope.dropdown0 = undefined;
            $scope.$broadcast('columnFilterChange',{columnIndex:0, options: sampleSearchOptions});
            $timeout.flush();
            $scope.onDropdownChange(0,sampleSearchOptions[0],sampleSearchOptions[0].id);
            $scope.onDropdownChange(0);
            $timeout.flush();
           /* var timeOut = function () {
                setTimeout(function () {
                    expect($scope.removeFilter).toHaveBeenCalled();
                }, 500);
            };*/
           // timeOut();
            expect($scope.updateResultCount).toHaveBeenCalled();
            expect($scope.resultCount).toEqual(2);
        })





    });
});
