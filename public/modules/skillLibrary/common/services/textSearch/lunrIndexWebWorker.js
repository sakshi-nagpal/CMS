'use strict';

(function () {
    function onMessage(e) {
        if( 'function' === typeof importScripts) {
            importScripts(e.data.base + '/../../../../../../lib/lunr.js/lunr.js');
        }
        var index = lunr(function () {
            for(var i = 0; i < e.data.indexFields.length; i++) {
                if(i === 0 ) {
                    this.ref(e.data.indexFields[i]);
                }
                else {
                    this.field(e.data.indexFields[i]);
                }
            }
        });
        lunr.stopWordFilter.stopWords.elements = [''];
        lunr.stopWordFilter.stopWords.length = 1;
        index.pipeline.remove(lunr.stemmer);
        e.data.input.forEach(function (document) {
            index.add(document);
        });
        self.postMessage(JSON.stringify(index.toJSON()));
    }
    addEventListener('message', onMessage);
}());
