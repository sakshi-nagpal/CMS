'use strict';

var _=require('lodash'),
    mongoose = require('mongoose'),
    BaseSchema = require('../models/baseEntity.server.model'),
    extend = require('mongoose-schema-extend'),
    logger = require('../../config/loggers/appLogger');

var dummySchema = BaseSchema.extend({},{strict:false});

var insertBulkData = function(data, collection){
    data.forEach(function(obj, i){
        data[i] = obj.toJSON();
    });
    var dataArray = [];
    var total = dataArray.length - 1;
    var savedData = [];
    while (data.length > 0)
        dataArray.push(data.splice(0, 1000));

    dataArray.forEach(function(data, index){
        collection.collection.insert(data, null,function(err, docs){
            savedData = savedData.concat(docs.ops);
            if(err){
                logger.error('Error creating collection ',collection,' : ',err);
                throw new Error('Error creating collection ',collection,' : ',err);
            } else if(index === total ){
                return savedData;
            }
        });
    });
};

var getMongooseModel = function(collectionName){
    if(!collectionName){
        collectionName = mongoose.model('DummyCollection');
    } else {
        collectionName = mongoose.model(collectionName);
    }
    return collectionName;
};

exports.createCollection = function(sourceData, collectionName, callbackObj){
    var data = sourceData.slice(0);
    if(!_.isArray(data)){
        data = [data];
    }

    if(!collectionName)
        collectionName = 'DummyCollection';


    var collection = mongoose.model(collectionName, dummySchema);
    var self = this;
    var collectionData = null;

    this.getCollection(collectionName).then(function(data){
        collectionData = data;
        if(data.length > 0){
            return self.removeDocuments(collectionName);
        } else
            return null;
    }, function(){
        console.log('here');
    }).then(function(){
        insertBulkData(data, collection);
    }).then(function(data){
        callbackObj.success(data);
    }).then(null, function(err){
        logger.error(err);
        callbackObj.error(err);
    });

};

exports.getCollection = function(collectionName){
    return getMongooseModel(collectionName).find().exec();
};

exports.removeDocuments = function(collectionName){
    return getMongooseModel(collectionName).remove().exec();
};

exports.dropCollection  = function(collectionName){
    return mongoose.connection.db.dropCollection(collectionName).exec();
};

exports.restoreCollection = function(destinationCollection, sourceCollection){
    if(typeof sourceCollection !== 'string')
        sourceCollection = sourceCollection.modelName;
    if(typeof destinationCollection === 'string')
        destinationCollection = mongoose.model(destinationCollection);

    return this.getCollection(sourceCollection).then(function(data){
        return insertBulkData(data,destinationCollection);
    }, function(error){
        throw new Error('error getting collection');
    });
};
