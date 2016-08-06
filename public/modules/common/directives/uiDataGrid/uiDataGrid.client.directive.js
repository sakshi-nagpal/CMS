'use strict';
define([], function() {
    return ['uiDataGrid', ['reSizer','$timeout','$compile','uiGridConstants', function(reSizer, $timeout, $compile, uiGridConstants) {

        return {
            restrict: 'E',
            replace: true,
            scope :{
                buttonCallback :'&',
                onRowSelect: '&',
                linkCallback :'&',
                gridConfig : '=',
                onColumnFilter : '&'
            },
            templateUrl: 'uiDataGrid.client.directive.html',

            controller : function ($scope, $element) {
                var viewportHeight, totalHeight, TotalFixedHeight, dataLength;
                /* label AAA so that it remains at top of sorted list in filter dropdown */
                var firstOption = {id:"All",label:"AAA", value:"All"};
                var error = {
                    noData:'No Skills Available',
                    noResults:'No Search Results Found'
                };

                $scope.gridData = {};
                $scope.gridData = JSON.parse(JSON.stringify($scope.gridConfig));

                $scope.searchEnabled = $scope.gridData.searchConfig;
                $scope.selections = [];
                $scope.data= {filterValue : ''};
                $scope.errorMessage = '';
                $scope.reSizer = reSizer;
                $scope.gridTitle= $scope.gridData.title;
                totalHeight = $scope.reSizer.getUpdatedHeight();

                $scope.onElementClick = function(event, data){
                    var callback = $(event.currentTarget).data('callback');
                    if(callback === 'undefined'){
                        return;
                    }
                    $scope[callback]({data: data, event :event});
                };

                $scope.showRowSelected = function(row, event){
                    if(!event)
                        return;
                    $scope.onRowSelect({data:row.entity, isSelected : row.isSelected});
                };

                $scope.clearText = function(){
                    $scope.data.filterValue = '';
                    $scope.gridApi.grid.refresh();
                };

                $scope.filterColumnCount = 10;
                var setUpdatedHeight = function(){
                    totalHeight = totalHeight - TotalFixedHeight;
                    viewportHeight = totalHeight - (totalHeight%$scope.gridOptions.rowHeight);
                    var filterHeight = viewportHeight - 4*$scope.gridOptions.rowHeight;
                    $scope.filterColumnCount = viewportHeight / $scope.gridOptions.rowHeight;
                    if($scope.filterColumnCount < 2)
                        $scope.filterColumnCount = 2;
                    $element.find('.selectpicker').attr('data-size', $scope.filterColumnCount);
                    $element.find('.selectpicker').selectpicker('refresh');
                    $element.find('.ui-grid-viewport').css('height',viewportHeight);
                };

                if($scope.searchEnabled){
                    $scope.placeholderText = $scope.gridData.searchConfig.placeholderText;
                }

				 $scope.onDropdownChange = function(index, obj, colFilter){
                    // remove filters on other columns
                    if(!$scope['dropdown'+index])

                        $scope.removeFilter(null, index);
                    if(!obj){
                        //obj is null for "All" option, thus remove filter
                        $scope.gridApi.grid.columns[index].colDef.filter.term = null;
                        $scope.updateResultCount();
                        return;
                    }
                    $scope.onColumnFilter({columnIndex:index, data:obj});
                    $scope.updateResultCount();
                };

                $scope.$on('columnFilterChange',function(event, data){
                    if(!$scope.gridApi)
                        return;
                    var options = data.options.slice();
                    options.unshift(firstOption);
                    $scope.gridApi.grid.columns[data.columnIndex].colDef.filter.term  = null;
                    $scope.gridApi.grid.columns[data.columnIndex].colDef.filter.selectOptions = options;
                    $scope['dropdown'+data.columnIndex] = options[0];

                    // reapply select picker
                    $timeout(function(){
                        $element.find('.selectpicker').selectpicker('refresh');
                    },0);

                });

                $scope.removeFilter = function(colFilter, index, event){
                    // set first element as selected on removing filters
                    if(event)
                        event.currentTarget.previousElementSibling.selectedIndex = 0;
                    // remove filters from dependent columns
                    angular.forEach($scope.gridData.columns[index].searchConfig.dependentCols, function(value){
                        $scope.gridApi.grid.columns[value].colDef.filter.term = null;
                        $scope.gridApi.grid.columns[value].colDef.filter.selectOptions = null;
                        $scope.gridApi.grid.columns[value].colDef.filter.selectOptions = [firstOption];
                        $scope['dropdown'+value] = firstOption;
                    });
                    // reapply select picker
                    $timeout(function(){
                        $element.find('.selectpicker').selectpicker('refresh');
                    },0);
                };

                $scope.gridData.columns.forEach(function(column, index){
                    var template = '';

                    if(column.hasOwnProperty('showCount')){
                        column.showCount = true;
                    }

                    $scope.term;
                    column.filterHeaderTemplate = '';

                    if(column.hasOwnProperty('searchConfig') && column.searchConfig.type =='dropdown'){
                        if(!column.searchConfig.options || !column.searchConfig.options.length){
                            column.searchConfig.options = [firstOption]
                        } else {
                            column.searchConfig.options.unshift(firstOption);
                        }
                        column.filter = {
                            term: null,
                            selectOptions: column.searchConfig.options
                        };

                        $scope['dropdown'+index] = column.searchConfig.options[0];

                        column.filterHeaderTemplate =
                            '<div  ui-grid-filter>'+
                            '<select class="form-control selectpicker header-dropdown ui-grid-filter-input-'+index+'" ng-model="grid.appScope.dropdown'+index+'"' +
                            'ng-options="option as option.value for option in colFilter.selectOptions | orderBy: \'label\' track by option._id"' +
                            'ng-change="colFilter.term = grid.appScope.dropdown'+index+'.id; grid.appScope.onDropdownChange('+index+', grid.appScope.dropdown'+index+', colFilter.term)" ' +
                            'data-container="body" data-size="{{grid.appScope.filterColumnCount}}">' +
                            '</select>'+
                            '</div>';

                    }

                    else if(column.hasOwnProperty('searchConfig') && column.searchConfig.type == 'textSearch'){

                        column.filterHeaderTemplate =   '<input type="text" class="ui-grid-filter-input phl"' +
                        'ng-keyup="grid.appScope.updateResultCount()" ng-model="colFilter.term" placeholder="'+column.searchConfig.placeholderText+'" />' +
                        '<div class="ui-grid-filter-button" ng-click="colFilter.term = null">' +
                        '<i class="icon-class search-icon text-grey2 fa fa-search"></i>'+
                        '<i class="ui-grid-icon-cancel" ng-show="!!colFilter.term" ng-click="grid.appScope.updateResultCount()">&nbsp;</i>' ;
                    }
                    column.headerCellTemplate =  '<div ng-class="{ \'sortable\': sortable }">' +
                    '<div class="ui-grid-cell-contents pan" col-index="renderIndex">' +
                    '<span class="mll">{{col.colDef.displayName}}</span>'+
                    '<span  class="mls" ng-if="'+column.showCount+'">({{grid.appScope.resultCount}})</span>'+
                    '<span ng-if="grid.appScope.resultCount || !grid.appScope.searchEnabled" "' +
                    'ui-grid-visible="col.sort.direction" class="mrm " ' +
                    'ng-class="{ \'ui-grid-icon-up-dir\': col.sort.direction == asc, \'ui-grid-icon-down-dir\':' +
                    ' col.sort.direction == desc,' + ' \'fa fa-unsorted sort-button\': ' +
                    '!col.sort.direction && sortable }">' +'&nbsp;' +
                    '&nbsp;' +
                    '</span>' +
                    '</div>' +
                    '<div ng-if="filterable" class="ui-grid-filter-container " ng-repeat="colFilter in col.filters">' +
                    column.filterHeaderTemplate+
                    '</div>' +
                    '</div>';

                    if(column.field && column.field.trim() !== ''){
                        template = '<span class="mll text-base show-ellipsis" ellipsis-tooltip="COL_FIELD">{{COL_FIELD}}</span>';
                    }

                    if(column.hasOwnProperty('cellTemplate')){
                        var cellTemplateattr = column.cellTemplate;


                        cellTemplateattr.forEach(function(cell){
                            if(cell.field){
                                cell.displayName = '{{row.entity.'+cell.field+'}}';
                            }else
                                cell.displayName = cell.staticDisplayName;

                            if(cell.type === 'button'){
                                template += '<button class="'+cell.className+'" ' +
                                'ng-click="grid.appScope.onElementClick($event, row.entity)" '+cell.attr+'' +
                                ' data-callback='+cell.callback+'>'+cell.displayName+'</button>&nbsp;';
                            }
                            else if(cell.type === 'link'){
                                template  += '<a class="'+cell.className+'" href="'+cell.href+'"' +
                                ' ng-click="grid.appScope.onElementClick($event, row.entity)"'+cell.attr+'' +
                                ' data-callback='+cell.callback+'>'+cell.displayName+'</a>&nbsp;';
                            }
                            else if(cell.type === 'html'){
                                var cellTemplate = $compile(cell.template)($scope);
                                if(cell.callback)
                                    $(cellTemplate).attr('ng-click','grid.appScope.'+cell.callback+ '()');
                                template += cellTemplate[0].outerHTML;
                            } else if(cell.type === 'ng-repeat') {
                                template += cell.template;
                            }
                        });
                    }
                    column.cellTemplate = template;

                });

                $scope.$watch('reSizer.getUpdatedHeight()',function (newValue, oldValue) {

                    if ( newValue !== oldValue ) {
                        totalHeight = newValue;
                        setUpdatedHeight();
                    }
                });
                $scope.gridOptions = {
                    data: $scope.gridData.data.sourceData,
                    columnDefs: $scope.gridData.columns,
                    rowHeight: ($scope.gridData.rowHeight) ? ($scope.gridData.rowHeight) : 40,
                    enableColumnMenus: false,
                    enableFiltering: true,
                    multiSelect : $scope.gridData.multiSelect ? $scope.gridData.multiSelect : false,
                    enableRowHeaderSelection: false,
                    onRegisterApi: function (gridApi) {
                        $scope.gridApi = gridApi;
                        if($scope.gridData.searchConfig){
                            $scope.gridApi.grid.registerRowsProcessor($scope.gridConfig.searchConfig.searchCallback ?
                                $scope.filterUsingIndexedSearch : $scope.filterUsingDefaultSearch, 200);
                        }
                        if($scope.gridData.data.selectedData){
                            $timeout(function () {
                                $scope.selectRows();
                            }, 0);
                        }
                        $scope.gridApi.selection.on.rowSelectionChanged($scope, $scope.showRowSelected);
                        $scope.updateResultCount();
                        $timeout(function() {
                            $element.find('.search-box').focus();
                            var parentFixedHeight = $scope.gridConfig.fixedHeight;
                            if($scope.searchEnabled){
                                TotalFixedHeight = $element.find('.search').outerHeight()+ parentFixedHeight +
                                $element.find('.ui-grid-header-viewport').outerHeight();
                            }else {
                                TotalFixedHeight = parentFixedHeight +$element.find('.ui-grid-header-viewport').outerHeight();
                            }
                            setUpdatedHeight();
                            // set select picker
                            $element.find('.selectpicker').selectpicker();
                            $element.find('.selectpicker').attr('data-size', $scope.filterColumnCount);
                        },0);
                    }
                };

                dataLength = $scope.gridOptions.data.length;
                if(dataLength){
                    if($scope.searchEnabled){
                        $scope.errorMessage = error.noResults;
                    }
                }else{
                    $scope.errorMessage = error.noData;
                }

                $scope.selectRows = function(){
                    $scope.setSelectedRowIndex();
                    $scope.gridApi.selection.clearSelectedRows();
                    $scope.selections.forEach(function (index) {
                        $scope.gridApi.selection.selectRow($scope.gridOptions.data[index]);
                    });
                };

                if($scope.gridOptions.multiSelect){
                    $scope.$watch('gridConfig.data.selectedData.length', function(newData, old ){
                        $scope.selectRows();
                    });
                }

                var renderedRows = null;
                $scope.filterUsingIndexedSearch = function(renderableRows) {
                    if(!renderedRows)
                        renderedRows = renderableRows;
                    if($scope.gridData.searchConfig.index && $scope.data.filterValue.length > 0 ) {
                        //scrollTo top for every result
                        $scope.gridApi.core.scrollTo($scope.gridOptions.data[0], $scope.gridOptions.columnDefs[0]);
                        var hiddenRows, result;
                        var match = false;
                        result = $scope.gridConfig.searchConfig.searchCallback($scope.data.filterValue);
                        renderedRows.forEach(function(row) {
                            row.visible = false;
                        });

                        result.forEach(function(res) {
                            renderedRows[res.index].visible = true;
                        });
                        $scope.resultCount = result.length;
                    } else {
                        $scope.resultCount = renderableRows.length;
                    }
                    return renderableRows;
                };

                $scope.filterUsingDefaultSearch = function(renderableRows){
                    //scrollTo top for every result
                    $scope.gridApi.core.scrollTo($scope.gridOptions.data[0], $scope.gridOptions.columnDefs[0]);

                    var matcher = new RegExp($scope.data.filterValue, 'i');
                    $scope.resultCount = renderableRows.length;
                    renderableRows.forEach( function( row ) {
                        var match = false;
                        $scope.gridData.searchConfig.indexedColumns.forEach(function( field ){
                            var data = row.entity[field];

                            if(!data)
                                return;

                            if (data.match(matcher) ){
                                match = true;
                            }

                        });
                        if ( !match ){
                            $scope.resultCount--;
                            row.visible = false;
                        }
                    });
                    return renderableRows;
                };


                $scope.updateResultCount = function(filterValue) {
                    // timeout of 100; grid takes more than one cycle to apply filters
                    $timeout(function(){
                        $scope.resultCount = $scope.gridApi.core.getVisibleRows($scope.gridApi.grid).length;
                        if(!$scope.resultCount){
                            $scope.errorMessage = error.noResults;
                        } else {
                            $scope.errorMessage = null;

                        }
                    },100);
                };

                $scope.filterRows = function(filterValue){
                    $scope.gridApi.grid.refresh();
                };

                $scope.setSelectedRowIndex = function(){
                    $scope.selections.splice(0,$scope.selections.length);
                    angular.forEach($scope.gridConfig.data.sourceData, function(item, index){
                        if(typeof item === 'object' && item.hasOwnProperty($scope.gridConfig.data.uniqueId)){
                            $scope.gridConfig.data.selectedData.forEach(function(data){
                                if(item[$scope.gridConfig.data.uniqueId]===data[$scope.gridConfig.data.uniqueId]){
                                    $scope.selections.push(index);
                                }
                            });
                        }
                    });
                };

            }

        };
    }]];
});

// sample Config of Data Grid

/*$scope.gridConfig =
 {
 data :{
 sourceData : dataTransformer.transformData($scope.skillData), -- data for the grid in flat array,
 selectedData : $scope.skills, - list of data to be shown selected by default
 uniqueId : 'skillId'  - unique identifier of the data array
 },
 searchConfig: { -- config of seraching in grid
 title : $scope.product, - Label to be shown for Search Box
 placeholderText :  $scope.placeholderText, - text to be shown in search box
 componentName : 'skillTagging',
 indexedColumns : ['skillId', 'title', 'parentLabels0', 'parentLabels1']
 },
 rowHeight: height of the row : default - 40px,
 multiSelect: true / false -- allow multiple rows selected simultaneously
 callback: 'onRowSelect', - required if multi-select true and thus entire row can be selected
 columns : [ -- array of columns
 {
 field: 'app', - property name in data
 displayName: 'Categories', - column name
 cellClass: 'className className2', - custom class to be added to the column
 width: '20%' - width of the column
 },
 {
 field: 'type',
 displayName: 'Sub-categories',
 width: '30%',
 cellClass: 'className1',
 cellTemplate: [ - if buttons or links need to be added to the cell
 {
 type: 'button',
 staticDisplayName: 'TAG', - if a static text is required in the column name
 className: 'buttonClassName', - custom classname
 callback: 'buttonCallback' - callback for button, optional
 attr :'' - attr for button
 },
 {
 type: 'link',
 staticDisplayName: 'Email',
 className: 'linkClassName',
 href : 'link',
 callback: 'linkCallback',
 attr :'' - attr for link
 },
 {
 type :'html',
 template : '<div>Data</div>',
 callback : 'dummyCallback'
 }
 ]
 },
 {
 field: 'title',
 displayName: 'Skills',
 width: '50%'
 }

 ]


 };*/
/*$scope.filterData = function(renderableRows){
 var matcher = new RegExp($scope.data.filterValue, 'i');

 renderableRows.forEach( function( row ) {
 var match = false;
 [ 'parentLabels0', 'parentLabels1', 'title' ].forEach(function( field ){
 var data = row.entity[field];

 if(!data)
 return;
 if(!$.isArray(data)){
 data = [row.entity[field]];
 }

 data.forEach(function(value){
 if (value.match(matcher) ){
 match = true;
 }
 });

 });
 if ( !match ){
 row.visible = false;
 }
 });
 return renderableRows;
 };*/



