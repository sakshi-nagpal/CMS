var mongoose = require('mongoose'),
    files = mongoose.model('files'),
    fs = require('fs'),
    config = require('../../config/config'),
    mkdirp = require('mkdirp');

exports.saveFile = function (file, fileLocation, callback) {
    var timeStamp = new Date().getTime();
    var fileName = file.name.split('.')[0] + '_' + timeStamp + '.' + file.name.split('.')[1];
    var filePath = config.fileSavePath + fileLocation;
    var fileSave = {"fileName": fileName, "filePath": fileLocation};
    mkdirp(filePath, function (err) {
        if (err) return callback(err);
        var fileStream = fs.createReadStream(file.path);
        fileStream.pipe(fs.createWriteStream(filePath + '/' + fileName));
        fileStream.on('close', function () {
            callback(null, fileSave);
        });
    });
};

exports.getFile = function (fileDb, callback) {
    var filePath = config.fileSavePath + fileDb.location + '/' + fileDb.tmpName;
    fs.readFile(filePath, function (err, file) {
        if (err) {
            return callback(err);
        }
        callback(null, file);
    });
};

exports.removeFile = function (fileDb, callback) {
    var filePath = config.fileSavePath + fileDb.location + '/' + fileDb.tmpName;
    fs.unlink(filePath, function (err) {
        if (err) return callback(err);
        callback(null);
    });
};
