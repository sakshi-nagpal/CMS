'use strict';

process.env.NODE_ENV = 'development';

var XLSX = require('xlsx'),
    mongoose = require('mongoose'),
    config = require('../../../config/config'),
    Promise = require('bluebird'),
    http = require('http'),
    util = require('util'),
	urlencode = require('urlencode');

var sheets = [
    {
        file: 'D:/Baloo_Pearson/app/migrators/skillMigrator/Skill Index Current_WD_XL.xls',
        sheetNumber : 0
    }
];

var cookie='ASP.NET_SessionId=vjdwjg55bwrthdn0u4zv3m45; .ASPXAUTH=2403213044EEFD1B5564F6D447732394024280B3FC4E81CF6DD5DEF5E827DB6848F99C6C9A2EA88BEAC90EDD695AD76891138167B91C37C8147D5376282E42964133ACA657E0ABA53D0E0EE7F25D88D223EB9BD360C236FCD55FF4AA34CDD9E36FF595CD30B8655E3E5DB37D13B3F4135B7F4BC3996B3574180D9047995B1960564FA7A5356674DAAFC41601500B34D921FCB21F5DDB3E94A2FE5D64CBD2C14A9E10EC496D75EEDA619DB8302A489322EE7AED8590932D5DE5A69F0EFA1AF7C313391F1C';
function getKey(json, checkKey){
    var value = '';
    for (var key in json){
        if(key.toLowerCase() === checkKey.toLowerCase()){
            value = json[key];
        }
    }
    return value;
}

var readSheet = function(sheet){
    var workbook = XLSX.readFile(sheet.file);

    var first_sheet_name = workbook.SheetNames[sheet.sheetNumber];

    /* Get worksheet */
    var rows = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[first_sheet_name]);

    var categoryCol = 'Category',
        subCategoryCol = 'Sub Category',
        skillCol = 'Current Skill Name',
        skillIdCol = 'Skill ID',
        application = 'Application';

    var skillMap = {};
    var types = [
        "skill_category",
        "skill_sub_category",
        "skill"
    ];

    var createReqPostData={
            "skill_category":"strJobs=3%2c10%7e1%2c1" +
                            "&iSectionID=%d" +
                            "&bRefreshCurrentlySelectedContent=True" +
                            "&iAppID=%d" +
                            "&strChapterNumber=%s" +
                            "&strChapterName=%s",

        "skill_sub_category":"strJobs=4%2c10%7e3%2c1" +
                            "&iChapterID=%d" +
                            "&bRefreshCurrentlySelectedContent=True" +
                            "&strProjectNumber=%s" +
                            "&strProjectName=%s" +
                            "&strProjectScenarioNameT1=" +
                            "&strProjectScenarioNameA1=" +
                            "&strProjectScenarioNameA2=" +
                            "&strProjectScenarioNameWEB=",

                    "skill":"iContentType=3" +
                            "&iProjectID=%d" +
                            "&bMultipleActivities=True" +
                            "&m_IACTIVITYCOUNT=8" +
                            "&strJobs=5,11~3,1~1,2~14,1" +
                            "&bRefreshCurrentlySelectedContent=true" +
                            "&strActivityName0=%s" +
                            "&strActivityDesc0=" +
                            "&strPageNos0=&stretextURL0=" +
                            "&strVideoURL0=" +
                            "&strOther0=" +
                            "&iPrimaryAppID0=%d" +
                            "&strSecondaryApps0=" +
                            "&iActivitiesAdded=1"
    };

    var launchReqPostData={

                'launchBook':'strJobs=0%2c2%7e1%2c1%7e14%2c1' +
                            '&iBookID=215' +
                            '&iSeriesID=107' +
                            '&strBookName=Library' +
                            '&strBookCode=LB' +
                            '&iContentType=1' +
                            '&strSeriesName=Library',

            'launchChapter':'strJobs=1%2c2%7e3%2c1%7e14%2c1' +
                            '&iChapterID=%d' +
                            '&strChapterNumber=%d' +
                            '&strChapterName=%s' +
                            '&iSectionID=%d' +
                            '&iContentType=3' +
                            '&strChapterAppIDs=%d' +
                            '&bPrimarySection=True' +
                            '&bAlignToMultiple=False'

    };

    var chapterCount={
        'word':0,
        'excel':0,
        'ppt':0,
        'office':0,
        'access':0
    };

    var projectCount={
        'word':{},
        'excel':{},
        'ppt':{},
        'access':{}
    };
    var chapterNameIdMap={
        'word':{},
        'excel':{},
        'ppt':{},
        'access':{}
    };
    var projectNameIdMap={
        'word':{},
        'excel':{},
        'ppt':{},
        'access':{}
    };


    var options = {
        hostname: 'billi.comprotechnologies.com',
        path: '/RequestHandler.aspx',
        method: 'POST',
        headers: {
            'Cookie': cookie,
            'Content-Type':'application/x-www-form-urlencoded'
        }
    };

    var currentChapterId, currentProjectId,currentChapterName,currentProjectName, doLaunchChapter;

    var ids={
        'word':{
            sectionId:316,
            appId:20
        },
        'excel':{
            sectionId:317,
            appId:21
        },
        'ppt':{
            sectionId:318,
            appId:22
        },
        'access':{
            sectionId:319,
            appId:23
        }
    };

    function launchBook(){
        var results;

        var launchReq = http.request(options, function (res) {
            res.on('data', function (chunk) {
                results = results + chunk;
            });
            res.on('end', function () {
                 console.log('got book  '+ results);

            });

        });

        var launchPostData = launchReqPostData['launchBook'];

        launchReq.write(launchPostData);
        launchReq.end();
    };

	function formEncodeString (value) {
      return value
        .replace(/ /g, '+')
        .replace(/[!'()~\*]/g, manuallyEncodeChar);
    };
	
	function manuallyEncodeChar (ch) {
      return '%' + ('0' + ch.charCodeAt(0).toString(16)).slice(-2).toUpperCase();
    };

    function getMinTwoDigit(n){ // for chapter Ids
        return n > 9 ? "" + n: "0" + n;
    }
	
    launchBook();


    var checkForEntity = function(level, titles, skillId, app, product, parent){
        return function() {
            return new Promise(function (fulfill, reject) {
                var key = product;
                if (level == 0) {
                    key = key + titles[0];
                } else {
                    for(var i=0;i<=level;i++){
                        key = key+titles[i];
                    }
                }
                if (getKey(skillMap, key)) {
                    if(level === (titles.length-1)){
                        fulfill(getKey(skillMap, key));
                    } else {
                        level++;
                        checkForEntity(level,titles,skillId,app, product,getKey(skillMap, key))().then(function(){
                            fulfill(getKey(skillMap, key));
                        });
                    }
                    return;
                }

                console.log("Adding "+ types[level] + " : "+  titles[level]);

                var postData,parseRegex;

                titles[level] = titles[level].trim();
                if(types[level] =='skill_category'){
                    parseRegex='strChapterName='+titles[level].replace(/\s/g,'+').replace(/['/']/g,'%2f') + '&iSectionID='+ids[product.toLowerCase()].sectionId; //diff sections can have same chapter name
                    currentChapterName=titles[level];
                    projectCount[product.toLowerCase()][currentChapterName.toLowerCase()]=0;
                    postData = util.format(createReqPostData[types[level]],ids[product.toLowerCase()].sectionId,ids[product.toLowerCase()].appId,getMinTwoDigit(++chapterCount[product.toLowerCase()]),formEncodeString(urlencode(titles[level])));
                }
                else if(types[level] =='skill_sub_category'){

                    parseRegex='strProjectName='+titles[level].replace(/\s/g,'+').replace(/['/']/g,'%2f').replace(/['&']/g,'%20%26%20') + '&';
                    var chapterKey = product + titles[0];
                    currentChapterName= getKey(skillMap,chapterKey); //small
                    currentChapterId=chapterNameIdMap[product.toLowerCase()][currentChapterName.toLowerCase()];
                    currentProjectName=titles[level].replace(/['&']/g,'%20%26%20').replace(/\s/g,'%20');
                    postData=util.format(createReqPostData[types[level]],currentChapterId,getMinTwoDigit(++projectCount[product.toLowerCase()][currentChapterName.toLowerCase()]),formEncodeString(urlencode(titles[level])));

                }
                else {

                    currentChapterId=chapterNameIdMap[product.toLowerCase()][currentChapterName.toLowerCase()];
                    currentProjectName=titles[1].replace(/['&']/g,'%20%26%20').replace(/\s/g,'%20'); //to do check when no project
                    currentProjectId=projectNameIdMap[product.toLowerCase()][currentProjectName.toLowerCase()];
                    var title = skillId + ": " + titles[level];
                    postData=util.format(createReqPostData[types[level]],currentProjectId,formEncodeString(urlencode(title)),ids[product.toLowerCase()].appId);

                }

                var results='';


                var req = http.request(options, function(res) {
                    res.on('data', function (chunk) {
                        results = results + chunk;
                    });
                    res.on('end', function () {
                        //console.log(results);
                        if(level==0)
                            parseResultForChapterId(results);
                        else if(level==1)
                            parseResultForProjectId(results);

                        skillMap[key] = titles[level];

                        if(level === (titles.length-1)){ //skill
                            fulfill();
                        } else { //category and sub-category
                            level++;
                            if(level==1)
                                launchChapter().then(function () {
                                    return checkForEntity(level,titles,skillId,app,product,null)();
                                }).then(function(){
                                    fulfill();
                                });

                            else
                                checkForEntity(level,titles,skillId,app,product,null)().then(function(){
                                    fulfill();
                                });
                        }

                    });

                });
                req.write(postData);
                req.end();


                function launchChapter() {

                    return new Promise(function (fulfill, reject) {
                        var launchReq = http.request(options, function (res) {
                            res.on('data', function (chunk) {
                                results = results + chunk;
                            });
                            res.on('end', function () {
                               //console.log(results);
                                fulfill();

                            });

                        });

                        var launchPostData = util.format(launchReqPostData['launchChapter'],currentChapterId,chapterCount[product.toLowerCase()],currentChapterName,ids[product.toLowerCase()].sectionId,ids[product.toLowerCase()].appId);

                        launchReq.write(launchPostData);
                        launchReq.end();
                    });
                };


                function parseResultForChapterId(results){

                    var resultArr = results.split(parseRegex);
                    var chapterIDIndex= resultArr[0].lastIndexOf('iChapterID=');
                    var tempStr=resultArr[0].toString().substr(chapterIDIndex+11,resultArr[0].length);
                    currentChapterId = parseInt(tempStr.substr(0,tempStr.indexOf('&')));
                   // console.log('22' + currentChapterId);

                    if(isNaN(currentChapterId))
                        process.exit(1);

                    chapterNameIdMap[product.toLowerCase()][currentChapterName.toLowerCase()]=currentChapterId;
                }


                function parseResultForProjectId(results){
                    var resultArr = results.split(parseRegex);
                    var projectIndex= resultArr[0].lastIndexOf('iProjectID=');
                    var tempStr=resultArr[0].toString().substr(projectIndex+11,resultArr[0].length);
                    currentProjectId = parseInt(tempStr.substr(0,tempStr.indexOf('&')));
                    //console.log('33' + currentProjectId);

                    if(isNaN(currentProjectId))
                        process.exit(1);

                    projectNameIdMap[product.toLowerCase()][currentProjectName.toLowerCase()]=currentProjectId;

                };
            });
        };
    };





    var promiseArray = [];
    for (var i=0; i< rows.length; i++) {
        var category = rows[i][categoryCol].trim();
        var skill = rows[i][skillCol] ? rows[i][skillCol].trim() : '';
        var skillId = rows[i][skillIdCol];
        var product = rows[i][application];
        if(product === 'PowerPoint'){
            product = 'PPT';
        }
        var app = product + " 2013";
        var subCategory;

        // check for no value in sub category - replace with name of category
        if (!rows[i][subCategoryCol])
            subCategory = category;
        else {
            subCategory = rows[i][subCategoryCol].trim();
        }

        var titles = [category, subCategory, skill];
        promiseArray.push(checkForEntity(0, titles ,skillId, app, product, null));

    }

    var count = 0;
    promiseArray.reduce(function(cur, next) {
        return cur.then(function(data){
            console.log('then: '+count++);
            return next();
        }).catch(function(err){
            console.log('error saving row: '+count);
        });
    }, Promise.resolve()).then(function() {
        console.log('all executed');
    }).catch(function(err){
        console.log('error: '+err)
    });

};

sheets.forEach(function(sheet){
    readSheet(sheet);
});

