'use strict';
define([], function () {
    return ['HtmlDiffCalculator', ['accentedCharConstants',function(accentedCharactersSet) {
        var CLASSNAME_CONST = {
            ADDED : 'added-text',
            DELETED : 'deleted-text',
            FORMATTED : 'formatted-text'
        };
        var accentedCharactersSet = angular.copy(accentedCharactersSet);

        var replaceKeys = ['<span style="color:rgb[(]255, 0, 0[)]">','<span style="color:rgb[(]0, 100, 0[)]">','<span style="color:rgb[(]0, 0, 255[)]">'];

        for(var i in replaceKeys){
            var value = accentedCharactersSet[replaceKeys[i]];
            delete accentedCharactersSet[replaceKeys[i]];
            replaceKeys[i] = replaceKeys[i].replace(/[\[\]]+/g,'');
            accentedCharactersSet[replaceKeys[i]] = value;
        }

        var changeSet;
        var oldChangeSet;

        function htmlComparator(data) {
            var str="";
            changeSet = data.changeSet;
            oldChangeSet = angular.copy(changeSet);

            for (var i = 0; i < changeSet.length; i++) {
                if (changeSet[i][0] === 1) {
                    //Case: 1 Content Added
                    convertChangeSet(i, CLASSNAME_CONST.ADDED);
                }
                else if (changeSet[i][0] === -1) {
                    //Case: 2 Content Deleted
                    convertChangeSet(i, CLASSNAME_CONST.DELETED);
                }
                else if (changeSet[i][0] === 0) {
                    //Case 3 : Content Equal but formatting added or deleted
                    createTagsChangeSet(i);
                }
                str = str.concat(changeSet[i][1]);
            }
            data.str = str;
            return data;
        }

        function convertChangeSet(index,className){
            // Case for Delete (Excluding the html tags)
            if(changeSet[index][0] === -1){
                for(var key in accentedCharactersSet){
                    var replacekey = new RegExp(accentedCharactersSet[key], 'g');
                    changeSet[index][1] = changeSet[index][1].replace(replacekey,'');
                }
            }
            addHtmlTagsAroundChangedSet(index,className,splitSampleIntoArray(index));
            replaceAccentedChar(index);
        }

        function splitSampleIntoArray(index){
            var spilttedText = changeSet[index][1].split("");
            var arr = [];
            var arrIndex = 0;
            var flag = false;
            arr[arrIndex]={
                0 : "",
                1 : true
            }

            for(var i =0;i<spilttedText.length;i++) {
                var accentedCharMatch = false;
                for (var key in accentedCharactersSet) {
                    if (spilttedText[i] == accentedCharactersSet[key]) {
                        accentedCharMatch = true;
                    }
                }
                //Accented Character Matches
                if(accentedCharMatch == true){
                    flag = true;
                    arrIndex++;
                    arr[arrIndex] = {
                        0: "",
                        1: false
                    }
                    arr[arrIndex][0] = arr[arrIndex][0].concat(spilttedText[i]);
                }
                else if (flag == true) {
                    flag = false;
                    arrIndex++;
                    arr[arrIndex] = {
                        0: "",
                        1: true
                    }
                    arr[arrIndex][0] = arr[arrIndex][0].concat(spilttedText[i]);
                }
                else {
                    arr[arrIndex][0] = arr[arrIndex][0].concat(spilttedText[i]);
                }
            }
            return arr;
        }

        function replaceAccentedChar(index){
            for(var key in accentedCharactersSet){
                var replacekey = new RegExp(accentedCharactersSet[key], 'g');
                changeSet[index][1] = changeSet[index][1].replace(replacekey,key);
            }
        }

        function createTagsChangeSet(index){
            var sample1 = ''; // sample created by changset 0 and 1
            var sample2 = ''; // sample created by changset 0 and -1
            var sample1TagsHierarchy = {};
            var sample2TagsHierarchy = {};
            var className='';

            //Create sample1 and sample2
            for(var k=0; k < index;k++){
                if(oldChangeSet[k][0] == 0){
                    sample1 = sample1.concat(oldChangeSet[k][1]);
                    sample2 = sample2.concat(oldChangeSet[k][1]);
                }
                else if(oldChangeSet[k][0] == -1){
                    sample1 = sample1.concat(oldChangeSet[k][1]);
                }
                else if(oldChangeSet[k][0] == 1){
                    sample2 = sample2.concat(oldChangeSet[k][1]);
                }
            }

            //Create Tags Hash map for sample1 and sample2
            sample1TagsHierarchy = createTagsHashMap(sample1);
            sample2TagsHierarchy = createTagsHashMap(sample2);

            var tagsHierarchyChangeSet = {};

            for(var key in sample1TagsHierarchy){
                if(sample2TagsHierarchy.hasOwnProperty(key)){
                    if(sample2TagsHierarchy[key] > sample1TagsHierarchy[key]){
                        //Added formatting
                        tagsHierarchyChangeSet[key] = sample2TagsHierarchy[key] - sample1TagsHierarchy[key];
                    }
                    else if(sample2TagsHierarchy[key] < sample1TagsHierarchy[key]){
                        tagsHierarchyChangeSet[key] = sample2TagsHierarchy[key] - sample1TagsHierarchy[key];
                    }
                    else{
                        delete sample2TagsHierarchy[key];
                        delete sample1TagsHierarchy[key];
                    }
                }
                else{
                    tagsHierarchyChangeSet[key] = sample1TagsHierarchy[key];
                }
            }
            if(Object.keys(sample1TagsHierarchy).length == 0  && Object.keys(sample2TagsHierarchy).length == 0){
                replaceAccentedChar(index);
            }else if(Object.keys(sample2TagsHierarchy).length > 0){
                for(key in sample2TagsHierarchy){
                    tagsHierarchyChangeSet[key] = sample2TagsHierarchy[key];
                }
            }
            if(Object.keys(tagsHierarchyChangeSet).length>0){
                hasFormattingChanged(tagsHierarchyChangeSet,index);
            }
        }

        function hasFormattingChanged(tagsHierarchyChangeSet,index){
            var item = splitSampleIntoArray(index);
            var str;
            var last;
            var wordsArray = [];
            var htmlTags;
            var flag = false;

            if(item.length >1){

                for(var i=0; i<item.length; i++){
                    if(flag){
                        item[i][1] = false;
                    }
                    else if(item[i][1] == false){
                        itemLoop:
                        for(var j=0; j<item[i][0].length;j++){
                            for(var key in accentedCharactersSet){
                                if(item[i][0][j]==accentedCharactersSet[key]){
                                    htmlTags = key;
                                }
                            }
                            str = htmlTags.replace('/','').replace('>','').trim();
                            if(htmlTags.indexOf('/')>0){
                                for(var k in tagsHierarchyChangeSet){
                                    if(k.match(new RegExp(str,'g'))){
                                        --tagsHierarchyChangeSet[k];
                                        if(Object.keys(tagsHierarchyChangeSet).length>0){
                                            last[1] = true;
                                        }
                                        if(tagsHierarchyChangeSet[k] == 0){
                                            delete tagsHierarchyChangeSet[k];
                                        }
                                        if(Object.keys(tagsHierarchyChangeSet).length<=0){
                                            flag = true;
                                            break itemLoop;
                                        }
                                    }
                                }
                            }
                            else if(tagsHierarchyChangeSet.hasOwnProperty(str)){
                                ++tagsHierarchyChangeSet[str];
                            }
                            else{
                                tagsHierarchyChangeSet[str] = 1;
                            }
                        }
                    }
                    else{
                        last = item[i];
                        wordsArray.push(last);
                        item[i][1] = false;
                    }
                }
            }
            if(Object.keys(tagsHierarchyChangeSet).length>=0){
                for(var i =0;i<wordsArray.length;i++){
                    wordsArray[i][1] = true ;
                }
            }
            addHtmlTagsAroundChangedSet(index,CLASSNAME_CONST.FORMATTED,item);
            replaceAccentedChar(index);
        }

        function addHtmlTagsAroundChangedSet(index,className,item){
            changeSet[index][1] = "";
            for(var j=0; j<item.length;j++){
                if(item[j][1] == true){
                    var div2 = document.createElement('span');
                    div2.className = className;
                    div2.innerHTML = item[j][0];
                    changeSet[index][1] = changeSet[index][1].concat(div2.outerHTML);
                }
                else{
                    changeSet[index][1] = changeSet[index][1].concat(item[j][0]);
                }
            }
        }

        function createTagsHashMap(sample){
            var sampleEnclosedTags = [];
            var flag = false;
            var arrayIndex = 0;
            var closingTag = false;
            var sampleEnclosedTagsHashMap = {};

            for(var key in accentedCharactersSet){
                var replaceKey = new RegExp(accentedCharactersSet[key], 'g');
                sample = sample.replace(replaceKey,key);
            }
            //Create Hash Map for sample
            if(sample){
                for(var i = 0;i<sample.length;i++){
                    if(flag == true && !sample.charAt(i).match(/>/g) && !sample.charAt(i).match(/</g) && !sample.charAt(i).match(/\//g)){
                        sampleEnclosedTags[arrayIndex] = sampleEnclosedTags[arrayIndex].concat(sample.charAt(i));
                    }
                    //Check for closing tag and finding index
                    else if(sample.charAt(i).match(/>/g)){
                        if(sampleEnclosedTagsHashMap.hasOwnProperty(sampleEnclosedTags[arrayIndex])){
                            ++sampleEnclosedTagsHashMap[sampleEnclosedTags[arrayIndex]];
                        }
                        else if(closingTag){
                            sampleEnclosedTags[arrayIndex] = sampleEnclosedTags[arrayIndex].replace("/","");
                            var items  = Object.keys(sampleEnclosedTagsHashMap);
                            if(items.length > 0){
                                for(var t=items.length-1; t>=0; t--){
                                    if(items[t].indexOf(sampleEnclosedTags[arrayIndex])>=0){
                                        --sampleEnclosedTagsHashMap[items[t]];
                                        if(sampleEnclosedTagsHashMap[items[t]] == 0){
                                            delete sampleEnclosedTagsHashMap[items[t]];
                                        }
                                        break;
                                    }
                                }
                            }
                            closingTag = false;
                        }
                        else{
                            sampleEnclosedTagsHashMap[sampleEnclosedTags[arrayIndex]] = 1;
                        }
                        flag = false;
                        arrayIndex++;

                    }
                    else if(sample.charAt(i).match(/\//g) && flag){
                        sampleEnclosedTags[arrayIndex] = sampleEnclosedTags[arrayIndex].concat(sample.charAt(i));
                        closingTag = true;
                        flag = true;
                    }
                    else if(sample.charAt(i).match(/</g)){
                        sampleEnclosedTags[arrayIndex] = "";
                        sampleEnclosedTags[arrayIndex] = sampleEnclosedTags[arrayIndex].concat(sample.charAt(i));
                        flag = true;
                    }
                }
                return sampleEnclosedTagsHashMap;
            }
            else{
                return {};
            }
        }

        return htmlComparator;
    }]];
});

