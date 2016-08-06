'use strict';

define(['bootstrapDateRangePicker','daterangepicker'], function() {
    return ['reportsController', ['$scope','$element','$timeout','Reports','Constants','$filter',
        function($scope,$element, $timeout, Reports, Constants, $filter)
    {
        var startDate,endDate,type,date;
        date = new Date();
        var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        $scope.datePicker = {};
        $scope.datePicker.date ={startDate: null, endDate:null};                          //for dateRangePicker
        $scope.dateRangePickerOptions = {                                                   //for dateRangePicker
            drops: 'up',
            applyClass: 'btn-primary',
            cancelClass: 'btn-primary',
            parentEl: '.date-picker-parent',
            maxDate: lastDay,
            format: 'DD-MMM-YY',
            eventHandlers :{
                'show.daterangepicker' : function(ev, picker) {
                    $element.find('.input-group-addon').addClass('bg-primary');
                    $element.find('.form-control').focus();
                    $element.find('.input-mini').attr('readonly', true).addClass('cursor-default'); 
                },
                'hide.daterangepicker' : function(ev, picker) {
                    $element.find('.input-group-addon').removeClass('bg-primary');
                },
                'apply.daterangepicker' : function(ev,picker) {
                    $timeout(function(){
                        $scope.datePicker.date.startDate = picker.startDate;
                        $scope.datePicker.date.endDate = picker.endDate;
                    },0);
                },
                'cancel.daterangepicker' : function(ev,picker){
                    $timeout(function(){
                        $scope.datePicker.date.startDate = null;
                        $scope.datePicker.date.endDate = null;
                        $element.find('.export-scenario').removeAttr('href');
                    },0);
                }
            }
        };
        $scope.onCalenderClick = function(){
            $element.find('.date-picker').click();
        };

        $scope.downloadUpdatedScenario = function(){
            startDate = $filter('date')(new Date($scope.datePicker.date.startDate), 'yyyy,M,d');
            endDate = $filter('date')(new Date($scope.datePicker.date.endDate._d.getTime() + (1000 * 60 * 60 * 24)), 'yyyy,M,d');
            type = Constants.STEP.SCENARIO;
            $element.find('.export-scenario').attr('href','/export/history/entityType/'+type+'/?startDate='+startDate+'&endDate='+endDate);
        };
        $scope.breadcrumbs = [{name:'Home',state:Constants.MODULES.dashboard}];
        $scope.seriesValue = 'series';
        $scope.taskValue = 'tasks';

        Reports.getSeries.query(function(series){
            $scope.$emit('hideLoader');
            $scope.series = series;
            var seriesTitle ={
                _id : 'Default Option',
                title: 'Choose a series'
            };
            $scope.series.unshift(seriesTitle);
            $scope.selectContentSeries = $scope.series[0];
            $scope.selectPathwaysSeries = $scope.series[0];
            $scope.selectTaskSeries = $scope.series[0];

            $timeout(function(){
                $element.find('.selectpicker').selectpicker();
                $element.find('.bootstrap-select .btn').attr('tabindex', 0);
            },0);
        });

        $scope.blurButton = function(event){
            event.target.blur();
        };

        $scope.downloadTaskData = function(){
            var exportTaskButton = $element.find('.export-task');
            if($scope.selectedOption== $scope.seriesValue){
                $element.find('.export-task').attr('href','export/series/task/'+$scope.selectTaskSeries._id);
                $timeout(function(){
                    exportTaskButton.removeAttr('href');
                },0);
            }else{
                var selectedIds = $scope.selected.ids.toUpperCase();
                Reports.scenariosExists.query({inputJson:selectedIds},function(data){
                    exportTaskButton.attr('href','export/task/data/?inputJson='+selectedIds );
                    $scope.errorMsg = '';
                    $timeout(function(){
                        exportTaskButton[0].click();
                        exportTaskButton.removeAttr('href');
                    },0);

                }, function(err){
                    $scope.errorMsg =$filter('translate')('reports.label_error_message');
                });
            }


        };
    }]];
});

