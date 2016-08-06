'use strict';

var XLSXWriter = require('xlsx-writestream');


exports.writeSheet = function(res, fileName){
    var writer;
    var wb = {};
    wb.SheetNames = ['content'];
    res.writeHead(200, [['Content-Type',  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
        ['Content-Disposition', 'attachment; filename='+fileName+'.xlsx']]);
    writer = new XLSXWriter(wb, {type:'buffer'} /* options */);
    writer.getReadStream().pipe(res);
    return writer;
};
