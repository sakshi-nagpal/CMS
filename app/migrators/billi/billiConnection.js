'use strict';

var sql = require('mssql'),
    config = require('../../../config/config'),
    Promise = require('promise'),
    connection = null,
    connectionPromise = null,
    errorInConnection = false;

var createConnection = function () {
    errorInConnection = false;

    connectionPromise = new Promise(function (fulfill, reject) {
        connection = new sql.Connection(config.billi.sqlConfig, function (err) {
            if (err) {
                errorInConnection = true;
                reject(err);
                return;
            }

            fulfill(connection);
        });
    });

    return connectionPromise;
};

var startTransaction = function (fulfill, reject) {
    var transaction = new sql.Transaction(connection);
    transaction.begin(function (err) {
        if (err) {
            reject(err);
            return;
        }

        var sqlRequestObject = new sql.Request(transaction);
        fulfill({
            sqlRequestObject: sqlRequestObject,
            transaction: transaction
        });
    });
};

exports.startTransaction = function () {
    return new Promise(function (fulfill, reject) {
        if (connectionPromise && !errorInConnection) {
            connectionPromise.then(function () {
                startTransaction(fulfill, reject);
            });
        } else {
            createConnection().then(function () {
                startTransaction(fulfill, reject);
            });
        }
    });
};

exports.closeConnection = function () {
    connection.close();
    connectionPromise = null;
};
