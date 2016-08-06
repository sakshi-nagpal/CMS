'use strict';

var mongoose = require('mongoose'),
    scenario = require('../models/scenario.server.model'),
    Scenario = mongoose.model('Scenario'),
    init = require('../../config/init')(),
    config = require('../../config/config'),
    appLogger = require('../../config/loggers/appLogger'),
    Promise = require('promise'),
    fs = require('fs');

var logDelimiter = '|';

var db = mongoose.connect(config.dbUri, config.dbOptions, function(err) {
    if (err) {
        console.error('Could not connect to MongoDB!');
        console.log(err.getErrorMessage(err));
    }
});
mongoose.connection.on('error', function(err) {
        console.error('MongoDB connection error: ' + err);

    }
);


//get all scenarios from BALOO-DB
var getBalooScenarioDocuments = function() {
    return Scenario.find().exec();
};

var removeZeroWidthSpaceCharacters = function(text) {
    return text.replace(/[\u200B-\u200D\uFEFF]/g, '');
};

var replaceSpaceCharacters = function(text) {
    return text.replace(/&nbsp;/g, ' ');
};

var removeFormat = function(format, text) {
    var textArray = text.split('<span' + format + '>');
    text= textArray[0] ? textArray[0] : '';

    for(var index=1, length=textArray.length; index<length; ++index) {
        text += textArray[index].replace('</span>', '');
    }

    return text.split(format).join('');
};

var removeColorFormat = function(text) {
    text = removeFormat(' style="color:rgb(68, 68, 68)"', text);
    text = removeFormat(' style="color:rgb(115, 115, 115)"', text);

    return text;
};

var cleanText = function(text) {
    text = removeZeroWidthSpaceCharacters(text);
    text = replaceSpaceCharacters(text);
    text = removeColorFormat(text);

    return text.trim();
};

var cleanStepData = function(stepsArray, freindlyId) {
    for(var stepIndex=0, stepLength=stepsArray.length; stepIndex<stepLength; ++stepIndex) {
        var step = stepsArray[stepIndex],
            methodsArray = step.methods,
            stepText = step.text;

        stepsArray[stepIndex].text = cleanText(stepText);

        if(stepText !== stepsArray[stepIndex].text) {
            appLogger.info('Text_Update' + logDelimiter + freindlyId + logDelimiter + stepIndex + logDelimiter + '-' + logDelimiter + '-' + logDelimiter + stepText + logDelimiter + stepsArray[stepIndex].text);
        }

        for(var methodIndex=0, methodLength=methodsArray.length; methodIndex<methodLength; ++methodIndex) {
            var method = methodsArray[methodIndex],
                actionsArray = method.actions;

            for(var actionIndex=0, actionLength=actionsArray.length; actionIndex<actionLength; ++actionIndex) {
                var actionText = actionsArray[actionIndex].text;
                stepsArray[stepIndex].methods[methodIndex].actions[actionIndex].text = cleanText(actionText);

                if(actionText !== stepsArray[stepIndex].methods[methodIndex].actions[actionIndex].text) {
                    appLogger.info('Text_Update' + logDelimiter + freindlyId + logDelimiter + stepIndex + logDelimiter + methodIndex + logDelimiter + actionIndex + logDelimiter + actionText + logDelimiter + stepsArray[stepIndex].methods[methodIndex].actions[actionIndex].text);
                }
            }
        }
    }
};

var cleanUp = function() {
    getBalooScenarioDocuments().then(function(scenarios) {
        var scenarioIndex, scenarioLength, promiseArray = [];

        for(scenarioIndex=0, scenarioLength=scenarios.length; scenarioIndex<scenarioLength; ++scenarioIndex) {
            cleanStepData(scenarios[scenarioIndex].steps, scenarios[scenarioIndex].friendlyId);
        }

        fs.writeFile('scenarioDocuments.txt', scenarios, function(err) {
            if(err)
            console.log('file write error');
            else
            console.log('file saved');
        });


        for(scenarioIndex=0, scenarioLength=scenarios.length; scenarioIndex<scenarioLength; ++scenarioIndex) {
            var scenario = scenarios[scenarioIndex];
            promiseArray.push(scenario.save());
        }
        return Promise.all(promiseArray);
    }).then(function() {
        console.log('scenarios cleaned');
    }, function(err) {
        console.log(err);
    });
};

cleanUp();
