'use strict';

var sql = require('mssql'),
	mongoose = require('mongoose'),
	scenario = require('../models/scenario.server.model'),
	task = require('../models/task.server.model'),
	Task = mongoose.model('Task'),
	Scenario = mongoose.model('Scenario'),
	init = require('../../config/init')(),
	config = require('../../config/config'),
	util = require('util'),
	_ = require('lodash'),
	Promise = require('promise');

var db = mongoose.connect(config.dbUri, config.dbOptions, function(err) {
	if (err) {
		console.error('Could not connect to MongoDB!');
		console.log(err.getErrorMessage(err));
	}
});

var dbQuery = 'select tas.vcPageNos pageNo, '+
	'tas.vcETextURL eTextURL, '+
	'tas.vcVideoURL videoURL '+
	'from tblActivities ta '+
	'join tblActivitiesSections tas '+
	'on ta.nActivityID = tas.nActivityID where ta.vcActivityName = \'%s\';';

var config = {
	user: 'billi',
	password: '',
	server: '192.168.2.51',
	database: 'Billi',
	domain: 'COMPRO',
	connectionTimeout: 900000,
	requestTimeout: 900000,
	options: {
		encrypt: false // Use this if you're on Windows Azure
	}
};

mongoose.connection.on('error', function(err) {
		console.error('MongoDB connection error: ' + err);
	}
);
var count = 0;

function getScenarios(contentRecord) {
	return new Promise(function (fulfill, reject){
		Scenario.find({title: contentRecord.title}, function(err, scenarios) {
			if (err) {
				return console.error(err);
			}
			if(scenarios) {
				if(scenarios.length === 0) {
					var connection = new sql.Connection(config, function(err) {
						var request = new sql.Request(connection);
						request.query(util.format(dbQuery ,contentRecord.title), function (err, records) {
							if(err){

								console.log(err);
							}
							if(records) {
								console.dir(records);
								console.log(' title: '+ contentRecord.title);
								contentRecord.data.eTextURL = records[0].eTextURL;
								contentRecord.data.videoURL = records[0].videoURL;
								contentRecord.data.pageNo = records[0].pageNo;
								contentRecord.data.scenarios = [];
							}
							fulfill();
						});
					});
				}
				else {
					contentRecord.data.scenarios = [];
					scenarios.forEach(function(scenario) {
						//count++;
						contentRecord.data.eTextURL = scenario.eTextURL;
						contentRecord.data.videoURL = scenario.videoURL;
						contentRecord.data.pageNo = scenario.pageNo;
						//contentRecord.data.scenarios = [];
						//contentRecord.data.scenarios.push(scenario._id);
					});
					fulfill();
				}

			}

		});
	});
}

function updateTasks() {
	Task.find({ type:'cms_task' }, function(err, contents) {
		if (err) {
			return console.error(err);
		}
		if(contents){
			contents.forEach(function(contentRecord){
				getScenarios(contentRecord).then(function(){
					contentRecord.save(function(err, success){
						if(err) {
							console.info('SAVE UNSUCCESSFUL IN DATABASE', err);
						}
						if(success) {
							count++;
							console.info('SAVE SUCCESSFUL IN DATABASE', count);
						}
					});
				});
			});
		}
	});
}

updateTasks();


