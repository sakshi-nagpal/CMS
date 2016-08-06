/*
* Created By SandeepK
* */
'use strict';

define([], function() {
    return ['versionFilter', function () {
        var filteredData;
        return function(input,filterType){
            if(filterType === 'all'){
                return input;
            }else{
                filteredData = input.filter(function(ele,index,array){
                    if(index === 0){
                        return true;
                    }
                    if(array[index +1] && (ele.phase.code === array[index +1].phase.code)){
                        return false;
                    }else{
                        return true;
                    }
                });
                return filteredData;
            }
        };
    }];
});
