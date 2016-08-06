'use strict';

define(['googleDiffMatchPatch'], function (diff_match_patch) {
    return ['JsonDiffCalculator', ['comparisonConstants','HtmlDiffCalculator','accentedCharConstants',function (comparisonConstants,htmlDiffCalculator,accentedCharactersSet) {

        var VALUE_TYPE_STRING = comparisonConstants.COMP_ENGINE_CONST.IN_BUILT_DATA_TYPES[0],
            VALUE_TYPE_ARRAY = comparisonConstants.COMP_ENGINE_CONST.IN_BUILT_DATA_TYPES[1],
            VALUE_TYPE_OBJECT = comparisonConstants.COMP_ENGINE_CONST.IN_BUILT_DATA_TYPES[2],
            VALUE_COMPARATOR = comparisonConstants.COMP_ENGINE_CONST.COMP_ENGINE[0],
            TEXT_COMPARATOR = comparisonConstants.COMP_ENGINE_CONST.COMP_ENGINE[1],
            PRIMARY_ATTR_AS_INDEX = comparisonConstants.COMP_ENGINE_CONST.PRIMARY_ATTR_ARRAY[0],
            PRIMARY_ATTR_AS_ID = comparisonConstants.COMP_ENGINE_CONST.PRIMARY_ATTR_ARRAY[1],
            PRIMARY_ATTR_AS_PROPERTY_VALUE = comparisonConstants.COMP_ENGINE_CONST.PRIMARY_ATTR_ARRAY[2];


        var diffMatchPatch = new diff_match_patch();
        function calculateDiffNode(obj1, obj2, sampleCompConfig, outputNode, currNode) {

            var sampleCompConfigCurrNode = sampleCompConfig[currNode];
            var currDiffDistance = 0;

            for(var mainLoopIndex = 0; mainLoopIndex < sampleCompConfigCurrNode.attr.length; mainLoopIndex++) {

                var currElement = sampleCompConfigCurrNode.attr[mainLoopIndex];

                var currAttrKey = currElement.key;
                var currAttrRef = currElement.ref;
                var currAttrType = currElement.type;
                var currAttrCompEngine = currElement.compEngine;
                var currAttrDiffPropagate = currElement.diffPropagation;
                var currAttrIsGenerated = currElement.generated;
                var currHtmlDiff = currElement.htmlDiff;


                var tempDiffChangeObj;

                if( !obj1[currAttrKey]) {
                    obj1[currAttrKey] = eval('new ' + currAttrType+ '()');
                }
                if( !obj2[currAttrKey]) {
                    obj2[currAttrKey] = eval('new ' + currAttrType+ '()');
                }

                if(!currAttrRef) {
                    if(currAttrType === VALUE_TYPE_STRING) {

                        tempDiffChangeObj = {
                            'changeSet': [],
                            'diffDistance': 0
                        };

                        if(currHtmlDiff == true){
                            for(var key in accentedCharactersSet){
                                var replacekey = new RegExp(key, 'gi');
                                if(obj1[currAttrKey]){
                                    obj1[currAttrKey] = obj1[currAttrKey].toString().replace(replacekey,accentedCharactersSet[key]);
                                }
                                if(obj2[currAttrKey]) {
                                    obj2[currAttrKey] = obj2[currAttrKey].toString().replace(replacekey, accentedCharactersSet[key]);
                                }
                            }
                        }

                        var sample1AsString = obj1[currAttrKey].toString().replace(/<[^>]*>/g, '');
                        var sample2AsString = obj2[currAttrKey].toString().replace(/<[^>]*>/g, '');

                        if(currAttrCompEngine === VALUE_COMPARATOR) {

                            //Case of both being empty string
                            if(!sample1AsString && !sample2AsString) {
                                tempDiffChangeObj.changeSet.push([0, '']);
                            }
                            else if(!sample1AsString) {
                                tempDiffChangeObj.changeSet.push([1, sample2AsString]);
                                //tempDiffChangeObj.diffDistance = sample2AsString.length;
                            }
                            else if(!sample2AsString) {
                                tempDiffChangeObj.changeSet.push([-1, sample1AsString]);
                                //tempDiffChangeObj.diffDistance = sample1AsString.length;
                            }
                            else if(sample1AsString !== sample2AsString) {
                                tempDiffChangeObj.changeSet.push([-1, sample1AsString], [1, sample2AsString]);
                                //tempDiffChangeObj.diffDistance = sample1AsString.length > sample2AsString.length
                                //	? sample1AsString.length : sample2AsString.length;
                            }
                            else {
                                tempDiffChangeObj.changeSet.push([0, sample1AsString]);
                            }

                            var valSemanticDiff = diffMatchPatch.diff_main(sample1AsString, sample2AsString);
                            diffMatchPatch.diff_cleanupSemantic(valSemanticDiff);

                            tempDiffChangeObj.diffDistance = diffMatchPatch.diff_levenshtein(valSemanticDiff);

                        }
                        else if(currAttrCompEngine === TEXT_COMPARATOR) {

                            var textSemanticDiff = diffMatchPatch.diff_main(sample1AsString, sample2AsString);
                            diffMatchPatch.diff_cleanupSemantic(textSemanticDiff);

                            tempDiffChangeObj.changeSet = textSemanticDiff;
                            tempDiffChangeObj.diffDistance = diffMatchPatch.diff_levenshtein(textSemanticDiff);
                        }

                        if(currAttrDiffPropagate)
                            currDiffDistance += tempDiffChangeObj.diffDistance;

                    }
                    else if(currAttrType === VALUE_TYPE_ARRAY) {

                        // TODO
                        // ref is null and the type of current element is an array
                        // index based default matching
                        // not applicable to the current scenario

                    }
                    else if(currAttrType === VALUE_TYPE_OBJECT) {

                        // TODO
                        // ref is null and the type of current element is an Object
                        // attribute based default matching
                        // not applicable to the current scenario

                    }
                }
                else if(currAttrRef) {

                    if(currAttrType === VALUE_TYPE_STRING) {

                        console.info('This console never comes!!');
                        // Not a valid scenario
                        // mostly this if block never outputs it's destined machine code
                        // if already handled during the sampleCompConfig sanity check

                    }
                    else if(currAttrType === VALUE_TYPE_ARRAY) {

                        if(!Array.isArray(obj1[currAttrKey])) {
                            console.info('Some error in the sampleCompConfig or sample jsons!!');
                            // TODO throw some error for the same
                        }
                        if(!Array.isArray(obj2[currAttrKey])) {
                            console.info('Some error in the sampleCompConfig or sample jsons!!');
                            // TODO throw some error for the same
                        }



                        if(sampleCompConfig[currAttrRef].primaryAttr === PRIMARY_ATTR_AS_ID){
                            var obj1CurrentArray = obj1[currAttrKey];
                            var obj2CurrentArray = obj2[currAttrKey];

                            var obj1Length = obj1CurrentArray.length;
                            var obj2Length = obj2CurrentArray.length;


                            // construct an array of _ids (objIds) from the two arrays (union of arrays ids)
                            var newIdObject,objIds = obj2CurrentArray.map(function(obj){
                                return obj._id;
                            });

                            angular.forEach(obj1CurrentArray, function(value, i) {
                                newIdObject = objIds.filter(function (objId) {
                                    return (objId === value._id);
                                });
                                if(!newIdObject.length){ // _id not found
                                    objIds.push(value._id);
                                }
                            });    // --- objIds Ready ---

                            var deleted = 0, added = 0, reordered = 0, obj1Candidate, obj2Candidate, obj1Order, obj2Order;

                            tempDiffChangeObj = [];
                            angular.forEach(objIds, function(objId, i) {
                                deleted = 0, added = 0, reordered = 0;

                                obj1Candidate = obj1CurrentArray.filter(function( obj,index ) {
                                            if(obj._id == objId) obj1Order = (index+1).toString();
                                            return obj._id == objId;
                                        })[0];
                                obj2Candidate = obj2CurrentArray.filter(function( obj, index ) {
                                            if(obj._id == objId) obj2Order = (index+1).toString();
                                            return obj._id == objId;
                                        })[0];

                                var tempOutput = Object.create(null);

                                if(!obj1Candidate || !obj2Candidate){

                                    var tempFillUP = {};
                                        for(var subLoopIndex = 0; subLoopIndex < sampleCompConfig[currAttrRef].attr.length; subLoopIndex++) {

                                            var subCurrElement = sampleCompConfig[currAttrRef].attr[subLoopIndex];

                                            if (currElement.type === VALUE_TYPE_STRING) {
                                                tempFillUP[currElement.key] = '';
                                            }
                                            else if (currElement.type === VALUE_TYPE_ARRAY) {
                                                tempFillUP[currElement.key] = [];
                                            }
                                            else if (currElement.type === VALUE_TYPE_OBJECT) {
                                                tempFillUP[currElement.key] = {};
                                            }
                                        }
                                    if(!obj1Candidate)
                                    {
                                        added = 1;
                                        obj1Order = obj2Order;
                                        obj1Candidate = tempFillUP;
                                    }
                                    else
                                    {
                                        deleted = 1;
                                        obj2Order = obj1Order;
                                        obj2Candidate = tempFillUP;
                                    }
                                }
                                else if(obj1Order !== obj2Order){
                                    reordered = 1;
                                }

                                obj1Candidate.order = obj1Order
                                obj2Candidate.order = obj2Order;

                                var tempNestedOutput = calculateDiffNode.call(this, obj1Candidate, obj2Candidate, sampleCompConfig, tempOutput, currAttrRef);


                                if(added){
                                    tempNestedOutput.added = 'history.label_added';
                                }else if(deleted){
                                    tempNestedOutput.deleted = 'history.label_deleted';
                                }else if(reordered){
                                    tempNestedOutput.added = 'history.label_reordered';
                                }



                                currDiffDistance += tempNestedOutput.diffDistance + added + deleted;
                                if(added || deleted){
                                    tempDiffChangeObj.splice(obj1Order-1, 0, tempNestedOutput);
                                }
                                else{
                                    tempDiffChangeObj.push(tempNestedOutput);
                                }

                            });

                        }

                        else if(sampleCompConfig[currAttrRef].primaryAttr === PRIMARY_ATTR_AS_INDEX) {

                            var obj1CurrentArray = obj1[currAttrKey];
                            var obj2CurrentArray = obj2[currAttrKey];

                            var obj1Length = obj1CurrentArray.length;
                            var obj2Length = obj2CurrentArray.length;
                            var deleted = 0, added = 0;

                            var lengthToIterate = obj1Length > obj2Length ? obj1Length : obj2Length;

                            tempDiffChangeObj = [];

                            for(var loopIndex = 0; loopIndex < lengthToIterate; loopIndex++) {

                                if(loopIndex > obj1Length-1 || loopIndex > obj2Length-1) {
                                    var tempFillUP = {};

                                    for(var subLoopIndex = 0; subLoopIndex < sampleCompConfig[currAttrRef].attr.length; subLoopIndex++) {

                                        var subCurrElement = sampleCompConfig[currAttrRef].attr[subLoopIndex];

                                        if (currElement.type === VALUE_TYPE_STRING) {
                                            tempFillUP[currElement.key] = '';
                                        }
                                        else if (currElement.type === VALUE_TYPE_ARRAY) {
                                            tempFillUP[currElement.key] = [];
                                        }
                                        else if (currElement.type === VALUE_TYPE_OBJECT) {
                                            tempFillUP[currElement.key] = {};
                                        }
                                    }

                                    if(loopIndex > obj1Length - 1) {
                                        obj1CurrentArray.push(tempFillUP); added=1;
                                    } else{
                                        obj2CurrentArray.push(tempFillUP); deleted = 1;
                                    }
                                }

                                var tempOutput = Object.create(null);
                                var tempNestedOutput = calculateDiffNode.call(this, obj1CurrentArray[loopIndex], obj2CurrentArray[loopIndex], sampleCompConfig, tempOutput, currAttrRef);
                                if(added){
                                    tempNestedOutput.added = 'history.label_added';
                                }else if(deleted){
                                    tempNestedOutput.deleted = 'history.label_deleted';
                                }
                                currDiffDistance += tempNestedOutput.diffDistance + added + deleted;
                                tempDiffChangeObj.push(tempNestedOutput);

                            }

                        }
                        else if(sampleCompConfig[currAttrRef].primaryAttr === PRIMARY_ATTR_AS_PROPERTY_VALUE){
                            if(sampleCompConfig[currAttrRef].primaryAttrValue === 'category._id'){
                                var obj1CurrentArray = obj1[currAttrKey];
                                var obj2CurrentArray = obj2[currAttrKey];

                                var obj1Length = obj1CurrentArray.length;
                                var obj2Length = obj2CurrentArray.length;


                                // construct an array of _ids (objIds) from the two arrays (union of arrays ids)
                                var newIdObject,objIds = obj2CurrentArray.map(function(obj){
                                    return obj.category;
                                });

                                angular.forEach(obj1CurrentArray, function(value, i) {
                                    newIdObject = objIds.filter(function (objId) {
                                        return (objId._id === value.category._id);
                                    });
                                    if(!newIdObject.length){ // _id not found
                                        objIds.push(value.category);
                                    }
                                });

                                objIds.sort(function(a,b){ //sort category by order
                                    return a.order - b.order;
                                })
                                  // --- objIds Ready ---

                                var deleted = false, added = false, obj1Candidate, obj2Candidate;

                                tempDiffChangeObj = [];
                                angular.forEach(objIds, function(objId, i) {
                                    deleted = false, added = false, reordered = false;

                                    obj1Candidate = obj1CurrentArray.filter(function( obj,index ) {
                                        return obj.category._id == objId._id;
                                    })[0];
                                    obj2Candidate = obj2CurrentArray.filter(function( obj, index ) {
                                        return obj.category._id == objId._id;
                                    })[0];

                                    var tempOutput = Object.create(null);

                                    if(!obj1Candidate || !obj2Candidate){

                                        var tempFillUP = {};
                                        for(var subLoopIndex = 0; subLoopIndex < sampleCompConfig[currAttrRef].attr.length; subLoopIndex++) {

                                            var subCurrElement = sampleCompConfig[currAttrRef].attr[subLoopIndex];

                                            if (currElement.type === VALUE_TYPE_STRING) {
                                                tempFillUP[currElement.key] = '';
                                            }
                                            else if (currElement.type === VALUE_TYPE_ARRAY) {
                                                tempFillUP[currElement.key] = [];
                                            }
                                            else if (currElement.type === VALUE_TYPE_OBJECT) {
                                                tempFillUP[currElement.key] = {};
                                            }
                                        }
                                        if(!obj1Candidate)
                                        {
                                            added = true;
                                            obj1Candidate = tempFillUP;
                                        }
                                        else
                                        {
                                            deleted = true;
                                            obj2Candidate = tempFillUP;
                                        }
                                    }

                                    var tempNestedOutput = calculateDiffNode.call(this, obj1Candidate, obj2Candidate, sampleCompConfig, tempOutput, currAttrRef);



                                    tempNestedOutput.added = added;


                                    if(tempNestedOutput.category.allowedAmount.changeSet[0][1] === "1" && tempNestedOutput.file.length > 1){
                                        tempNestedOutput.file = tempNestedOutput.file.filter(function( obj, index ) {
                                            return obj.added;
                                        });
                                        tempNestedOutput.updated = 'history.label_updated_doc';

                                    }

                                    currDiffDistance += tempNestedOutput.diffDistance;
                                    tempDiffChangeObj.push(tempNestedOutput);
                                });


                            }
                            else{
                                // TODO not applicable as of now...
                            }
                        }
                        else{
                            // TODO not applicable as of now...
                        }

                    }
                    else if(currAttrType === VALUE_TYPE_OBJECT) {

                        // TODO
                        // ref is not null and the type of current element is an Object
                        // go to the referenced object and loop through the attributes in that node
                        // not applicable to the current scenario
                        var obj1CurrentObject = obj1[currAttrKey];
                        var obj2CurrentObject = obj2[currAttrKey];
                        //angular.forEach(sampleCompConfig[currAttrRef].attr, function(value, i) {
                        //    var tempOutput = Object.create(null);
                        //    var tempNestedOutput = calculateDiffNode.call(this, obj1CurrentObject[value], obj2CurrentObject[value], sampleCompConfig, tempOutput, currAttrRef);
                        //    tempDiffChangeObj.push(tempNestedOutput);
                        //});
                        tempDiffChangeObj = {};
                        var tempOutput = Object.create(null);
                        var tempNestedOutput = calculateDiffNode.call(this, obj1CurrentObject, obj2CurrentObject, sampleCompConfig, tempOutput, currAttrRef);

                        tempDiffChangeObj = tempNestedOutput;
                    }

                }
                if(currHtmlDiff === true){
                    outputNode[currAttrKey] = htmlDiffCalculator(tempDiffChangeObj);
                }
                else{
                    outputNode[currAttrKey] = tempDiffChangeObj;
                }
            }

            outputNode['diffDistance'] = currDiffDistance;

            return outputNode;
        }

        return calculateDiffNode;
    }]];
});
