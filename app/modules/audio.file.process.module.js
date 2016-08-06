'use strict';

var Promise = require('promise'),
    fs = require('fs'),
    config = require('../../config/config'),
    documentApi = require('../modules/document.api.server.module'),
    builder = require('xmlbuilder');

function validateTimeStrings(timingArray) {
    for (var index = 0; index < timingArray.length; index++) {
        var timeValues = timingArray[index].split(':');
        if (timeValues.length !== 3) {
            return false;
        }
        else if (isNaN(timeValues[0]) || parseInt(timeValues[0]) > 59) {
            return false;
        }
        else if (isNaN(timeValues[1]) || parseInt(timeValues[1]) > 59) {
            return false;
        }
        else if (isNaN(timeValues[2]) || parseInt(timeValues[2]) > 999) {
            return false;
        }
    }
    return true;
}

function getPrimaryMethod(step) {
    for (var methodIndex = 0; methodIndex < step.methods.length; methodIndex++) {
        if (step.methods[methodIndex].primary) {
            return step.methods[methodIndex];
        }
    }
}

exports.validateAudioTimingFile = function (scenario, timingArray) {

    return new Promise(function (resolve, reject) {
        var actionCount = 0;

        scenario.steps.forEach(function (step) {
            step.methods.forEach(function (method) {
                if (method.primary) {
                    actionCount += method.actions.length;
                }
            });
        });

        if (timingArray.length !== actionCount * 2) {
            reject(new Error('Invalid combination for timing file!'));
        }
        else if (!validateTimeStrings(timingArray)) {
            reject(new Error('Invalid time format in file!'));
        }
        else {

            var currentIndex = 0;
            scenario.steps.forEach(function (step) {
                step.methods.forEach(function (method) {
                    if (method.primary) {
                        method.actions.forEach(function (action) {
                            action.start = timingArray[currentIndex++].replace(/(\r)/g, '').trim();
                            action.end = timingArray[currentIndex++].replace(/(\r)/g, '').trim();
                        });

                    }
                });
            });

            resolve(scenario);
        }
    });
};

exports.getTimingXMLForScenario = function (scenario) {

    var font = '<font style=font-family:Verdana;font-size:12px>';
    var language = {language: '1'};

    var taskComment = 'Description of the entire task';
    var itemComment = 'Description of the item. The span tags are NECESSARY so that the player can identify each item ' +
        'and change the formatting at runtime';
    var mp3dataComment1 = 'Contains MP3 timing offsets for  English (language = 1) along with text for each step...';
    var mp3dataComment2 = 'Each mp3 element contains the time in mm:ss:msmsms format. If a frame has no audio, the time offset ' +
        'should be 00:00:000. The audio parser should also ensure that the start offset is not greater than its end offset.';

    var xml = builder.create('task', {version: '1.0', encoding: 'UTF-8', standalone: true});

    xml.att('version_major', '1');
    xml.att('version_minor', '0');

    xml.ele('description').dat(scenario.title).com(taskComment);

    var items = xml.ele('items');
    var mp3data;
    var primaryMethod;
    var mp3;

    for (var stepIndex = 0; stepIndex < scenario.steps.length; stepIndex++) {
        var item = items.ele('item');
        var descriptionValue = '<Span id=' + (stepIndex + 1) + '>' + font + scenario.steps[stepIndex].text + '</font></Span>';
        item.ele('description').dat(descriptionValue).com(itemComment);
        mp3data = item.ele('mp3data', language);
        mp3data.com(mp3dataComment1);
        mp3data.com(mp3dataComment2);
        primaryMethod = getPrimaryMethod(scenario.steps[stepIndex]);

        if(primaryMethod) {
            for (var actionIndex = 0; actionIndex < primaryMethod.actions.length; actionIndex++) {
                mp3 = mp3data.ele('mp3');
                mp3.att('start', primaryMethod.actions[actionIndex].start);
                mp3.att('stop', primaryMethod.actions[actionIndex].end);
                mp3.dat(primaryMethod.actions[actionIndex].text);
            }
        }
    }

    var xmlString = xml.end({pretty: true, indent: '  ', newline: '\n'});
    return xmlString;
};

