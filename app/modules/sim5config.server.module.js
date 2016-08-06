'use strict';

var Promise = require('bluebird');


exports.launchSimulation = function(config, friendlyId){
    return new Promise(function(resolve, reject){
        if(config.type === 'basic'){
            var taskId = '';
            if(friendlyId)
                taskId = config.launchUrl.friendlyId;
            var url = config.domain + '/' + config.launchUrl.context + '/' + config.launchUrl.launchSIM + taskId + friendlyId +'&balooPreview=true';
            return resolve(url);
        } else {
            return reject('No URL for non basic authentication type');
        }
    });
}
