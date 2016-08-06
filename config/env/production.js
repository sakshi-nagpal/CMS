'use strict';

module.exports = {
    dbUri: 'mongodb://10.76.24.34,10.76.24.35,10.76.24.36/baloo',
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
        user: 'balooapp',
        pass: 'Ikki8989'
    },
    logLevel: 'error',
	appdynamics : {
		'controllerHostName' : 'pearson.saas.appdynamics.com',
		'accountName' : 'pearson_prod',
		'accountAccessKey' : 'tbd',
		'applicationName' : 'Baloo_Production',
		'tierName' : 'BalooApp',
		'nodeName' : '-'
	},
    fileSavePath: '/mnt/nfs/baloo/repository/documents/',
    importSeriesPath: '/mnt/nfs/baloo/import/series/',
    importSkillIndexPath: '/mnt/nfs/baloo/import/skillIndex/'
};
