var skillTool = {
    dataSet : {
        leftData : {},
        rightData : {}
    },
    templates : {
        inputTemplate : null,
        viewHeaderTemplate : null,
        viewContentTemplate : null
    },
    comparator : null
};

Handlebars.registerHelper('ifObject', function(object, options) {
    if(typeof object == "object") {;
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});
Handlebars.registerHelper('ifEqual', function(v1, v2, options) {
    if(v1 == v2) {
        return options.fn(this);
    }
    return options.inverse(this);
});

$(document).ready(function(){
    initApp();
    paintInputView($(".left-view.view-input"));
    paintInputView($(".right-view.view-input"));
    bindEvents();
});

function initApp() {

    //Pre compile the templates
    var source = $("#input-template").html();
    skillTool.templates.inputTemplate = Handlebars.compile(source);

    source = $("#view-header-template").html();
    skillTool.templates.viewHeaderTemplate = Handlebars.compile(source);

    source = $("#view-content-template").html();
    skillTool.templates.viewContentTemplate = Handlebars.compile(source);

    //Initialize the comparator
    var comparatorEngine = require("comparatorEngine");
    var itemConfig = require("itemConfig");
    skillTool.comparator = new comparatorEngine(itemConfig);
}

function bindEvents() {
    $(".submit-button").on("click",function(event){
        var $this = $(this);
        var column = $this.data('column');
        var inputVal = $(".view-input." + column + " .task-input").val().split(",");
        if(!inputVal[1]) {
            showAlert("Please enter a item number after comma");
            event.preventDefault();
            return;
        }
        $(".view-item-header."+column).addClass('loading');
        $.ajax({
            url : "http://billi.comprotechnologies.com/SIMsInternal/internal/ScenarioPathways.ashx?scenario=" + inputVal[0],
            type : "GET",
            success : function(data) {
                $(".view-item-header."+column).removeClass('loading');
                if(data["ErrorMessage"]) {
                    showAlert("Error in loading task : " + data["ErrorMessage"]);
                    return;
                }
                var dataToPaint = data["ScenarioItemList"][parseInt(inputVal[1])-1];
                if(!dataToPaint) {
                    showAlert("Error in loading task : Invalid item number");
                    return;
                }
                dataToPaint["ScenarioPathwayList"].sort(function(a,b) {
                    return a["MethodOrder"] > b["MethodOrder"]
                });
                paintView(dataToPaint,column,true);
                if(column == "left-view") {
                    skillTool.dataSet.leftData = dataToPaint;
                } else if(column == "right-view") {
                    skillTool.dataSet.rightData = dataToPaint;
                }
            },
            error : function() {
                showAlert("Error in loading task : Internal Server error");
            }
        });
        event.preventDefault();
    });
    $(".compare-button").on("click",function(){
        var diff = skillTool.comparator.compare(skillTool.dataSet.leftData, skillTool.dataSet.rightData);
        paintView(diff,"compare-view",false);
        $(".compare-view-box").removeClass('hidden');
        scrollTo($('#compare-view').position().top);
        if(typeof diff["diffDistance"] !== "undefined") {
            $(".page-header .diff-tag").html(diff["diffDistance"]);
        } else {
            $(".page-header .diff-tag").addClass('hide');
        }
    });
    $(window).scroll(function(){
        if ($(this).scrollTop() > 100) {
            $('.scroll-top').fadeIn();
        } else {
            $('.scroll-top').fadeOut();
        }
    });

    //Click event to scroll to top
    $('.scroll-top').click(function(){
        scrollTo(0);
    });

    //focus ok-button after modal has been shown
    $("#error-modal").on("shown.bs.modal", function () {
        $(this).find(".ok-button").focus();
    });
}

function paintInputView($inputBox) {
    var inputHtml = skillTool.templates.inputTemplate({ column : $inputBox.data('column')});
    $inputBox.html(inputHtml);
}

function paintView(data,className,isSortable) {
    var $headerView = $(".view-item-header."+className + " .content");
    var $contentView = $(".view-item-content."+className);

    data["isSortable"] = isSortable;

    var html = skillTool.templates.viewHeaderTemplate(data);
    $headerView.html(html);

    html = skillTool.templates.viewContentTemplate(data);
    $contentView.html(html);

    if(isSortable) {
        $contentView.find(".draggable-list").sortable({
            handle : ".glyphicon-move",
            animation: 300,
            ghostClass: "sortable-ghost",
            onUpdate : function(evt) {
                var data;
                if(className == "left-view") {
                    data = skillTool.dataSet.leftData;
                } else if(className == "right-view") {
                    data = skillTool.dataSet.rightData;
                }
                var elementToShift = data.ScenarioPathwayList[evt.oldIndex]; //get the element to shift
                data.ScenarioPathwayList.splice(evt.oldIndex,1); //remove from the current position
                data.ScenarioPathwayList.splice(evt.newIndex,0,elementToShift); //add it to new position
            }
        });
    }
}

function scrollTo(topPosition) {
    $('html, body').animate({scrollTop:topPosition}, '500');
}

function showAlert(text) {
    $("#error-modal .text").text(text);
    $("#error-modal").modal();
}