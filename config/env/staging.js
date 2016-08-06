'use strict';

module.exports = {
	dbUri: 'mongodb://10.76.10.66,10.76.10.67,10.76.10.68/baloo',
	dbOptions: {
        server: {
            poolSize: 20,
            socketOptions: {keepAlive: 1, connectTimeoutMS: 30000}
        },
		replset: {
			rs_name: 'BALOO',
			poolSize: 20,
			socketOptions: {keepAlive: 1, connectTimeoutMS: 30000}
		},
		user : 'balooapp',
		pass : 'Bagheer@'
    },
	appdynamics : {
		'controllerHostName' : 'pearson_nonprod.saas.appdynamics.com',
		'accountName' : 'pearson_nonprod',
		'accountAccessKey' : 'f69d8d55048a',
		'applicationName' : 'Baloo_Staging',
		'tierName' : 'BalooApp',
		'nodeName' : '-'
	},
	logLevel: 'error',
	fileSavePath: '/mnt/nfs/baloo/repository/documents/',
    importSeriesPath: '/mnt/nfs/baloo/import/series/',
    importSkillIndexPath: '/mnt/nfs/baloo/import/skillIndex/'
};