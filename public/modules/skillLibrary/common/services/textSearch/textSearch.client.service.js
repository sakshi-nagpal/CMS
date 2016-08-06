'use strict';

define ([
    'lunr',
    'lunrIndexWebWorker'
], function(lunr) {

    return ['TextSearch', ['$q', 'Storage','$rootScope',
        function ($q, Storage, $rootScope) {

            var mappedData, indexedKey;
            var index,indexedColumns;
            lunr.stopWordFilter.stopWords.elements = [''];
            lunr.stopWordFilter.stopWords.length = 1;
            function saveIndex(event) {
                Storage.setSessionStorageItem(indexedKey, event.data);
                index = lunr.Index.load(JSON.parse(event.data));
                return event.data;
            }

            return {
                isInitialized : function() {
                    if(index) {
                        return true;
                    }
                },

                loadIndex: function (data, columns, indexKey, inputLabel) {
                    indexedColumns = columns;
                    indexedKey = indexKey + '.' + inputLabel;
                    index = Storage.getSessionStorageItem(indexedKey);
                    mappedData = data.map(function (data) {
                        var mapper = {};
                        for(var i =0; i<indexedColumns.length;i++) {
                            mapper[indexedColumns[i]] = data[indexedColumns[i]];
                        }
                        return mapper;
                    });

                    if(!index) {
                        var worker = new Worker($rootScope.baseURL+'/modules/skillLibrary/common/services/textSearch/lunrIndexWebWorker.js');
                        var defer = $q.defer();
                        worker.addEventListener('message', function(event) {
                            $q.when(saveIndex(event))
                                .then(defer.resolve())
                                .then(worker.terminate())
                                .catch(function (error) {
                                    console.log('error creating index: ', error);
                                });
                        }, false);
                        worker.postMessage({input : data, indexFields : indexedColumns, base: $rootScope.baseURL}); // Send data to our worker.
                        return defer.promise;
                    } else {
                        index = lunr.Index.load(index);
                    }
                    return index;
                },

                search: function (text) {
                    return index.search(text).map(function (result) {
                        return mappedData.filter(function (data) {
                            return data[indexedColumns[0]] === result.ref;
                        })[0];
                    });
                }
            };
        }
    ]];
});

