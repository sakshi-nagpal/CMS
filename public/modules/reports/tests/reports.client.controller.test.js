'use strict';


define(['reportsModule', 'angularMocks'], function(app) {
    describe('reportsController', function() {

        //Initialize global variables
        var scope,
            reportsController,
            $httpBackend,
            $timeout,
            $filter,
            template,
            $compile,
            element;

        var seriesTitle ={
            _id : "Default Option",
            title: "Choose a series"
        };

        var series =[
            {
                _id : "1234",
                title: "GO series"
            },
            {
                _id : "12345",
                title: "Exploring Series"
            }
        ];
        var inputJson = "1,2,3";
        var type = 'SCENARIO';

        // Load the main application module

        beforeEach(module(ApplicationConfiguration.applicationModuleName, function ($translateProvider) {
            $translateProvider.translations('en', {});
        }));



        beforeEach(inject(function($controller, $rootScope,_$httpBackend_,_$timeout_,
                                   _$compile_,_$templateCache_,_$filter_) {
            scope = $rootScope.$new();
            $httpBackend = _$httpBackend_;
            $timeout=_$timeout_;
            $filter = _$filter_;
            $compile = _$compile_;
            $httpBackend.expect('GET','series/all')
                .respond(series);

            template = $(_$compile_(_$templateCache_.get('reports.client.view.html'))(scope));
            reportsController = $controller('reportsController', {
                $scope: scope,
                $element :template
            });


            scope.datePicker ={
                date :{
                    startDate :{
                        _d : 'Wed Oct 07 2015 00:00:00 GMT+0530 (India Standard Time)'
                    },
                    endDate:{
                        _d: {
                            getTime: function () {
                                return 1444760999999;
                            }
                        }

                    }
                }
            };

            $httpBackend.flush();
            $timeout.flush();
            scope.$digest();
        }));


        it('should check if scope variables are defined',function(){
            expect(scope.series.length).toEqual(3);
            expect(scope.taskValue).toEqual("tasks");
            expect(scope.seriesValue).toEqual("series");
            expect(scope.selectContentSeries).toEqual(scope.series[0]);
            expect(scope.selectPathwaysSeries).toEqual(scope.series[0]);
            expect(scope.selectTaskSeries).toEqual(scope.series[0]);
        });

        it('should call blur button function on button click ',function(){
            spyOn(scope, 'blurButton').and.callThrough();
            template.find('.content-button').click();

            expect(scope.blurButton).toHaveBeenCalled();
        });

        it('should download task Data of series if selectedOption is series ',function(){
            scope.selectedOption=scope.seriesValue;
            scope.selectTaskSeries._id = '123';
            scope.downloadTaskData();
            expect(template.find('.export-task').attr('href')).toEqual('export/series/task/'+scope.selectTaskSeries._id );
            $timeout.flush();

        });
        it('should download task Data of correct TaskIds if selectedOption is task',function(){
            scope.selectedOption=scope.taskValue;
            $httpBackend.expect('GET','export/scenarios/exists?inputJson=').respond(200);
            scope.downloadTaskData();
            $httpBackend.flush();
            expect(template.find('.export-task').attr('href')).toEqual('export/task/data/?inputJson=');
            $timeout.flush();

            // [0].click()

        });
        it('should not download task Data of incorrect TaskIds if selectedOption is task',function(){
            scope.selectedOption= scope.taskValue;
            $httpBackend.expect('GET','export/scenarios/exists?inputJson=').respond(400);
            scope.downloadTaskData();
            $httpBackend.flush();
            expect(scope.errorMsg).toEqual('reports.label_error_message');
            expect(template.find('.export-task').attr('href')).not.toBeDefined();
        });

        it('should not download task Data of incorrect TaskIds if selectedOption is task',function(){
            scope.selectedOption= scope.taskValue;
            $httpBackend.expect('GET','export/scenarios/exists?inputJson=').respond(400);
            scope.downloadTaskData();
            $httpBackend.flush();
            expect(scope.errorMsg).toEqual('reports.label_error_message');
            expect(template.find('.export-task').attr('href')).not.toBeDefined();
        });

        it('should show calender on calender click',function(){

            spyOn(scope.dateRangePickerOptions.eventHandlers, 'show.daterangepicker').and.callThrough();
            scope.onCalenderClick();
            var timeOut = function () {
                setTimeout(function () {
                    expect(scope.dateRangePickerOptions.eventHandlers['show.daterangepicker']).toHaveBeenCalled();
                }, 500);
            };
            timeOut();

        });


        it('should download scenario task history if dated are selected',function(){
            var startDate = $filter('date')(new Date(scope.datePicker.date.startDate), 'yyyy,M,d');
            var endDate = $filter('date')(new Date(scope.datePicker.date.endDate._d.getTime() + (1000 * 60 * 60 * 24)), 'yyyy,M,d');
            scope.downloadUpdatedScenario();
            expect(template.find('.export-scenario').attr('href')).toEqual('/export/history/entityType/'+type+'/?startDate='+startDate+'&endDate='+endDate);

        });

        afterEach(function() {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });
    });
});
