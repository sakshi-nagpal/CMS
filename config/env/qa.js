'use strict';

module.exports = {
	dbUri: process.env.MONGOHQ_URL || process.env.MONGOLAB_URI || 'mongodb://' + (process.env.DB_1_PORT_27017_TCP_ADDR || 'localhost') + '/baloo',
	logLevel: 'error',
	mailer: {
		from: process.env.MAILER_FROM || 'MAILER_FROM',
		options: {
			service: process.env.MAILER_SERVICE_PROVIDER || 'MAILER_SERVICE_PROVIDER',
			auth: {
				user: process.env.MAILER_EMAIL_ID || 'MAILER_EMAIL_ID',
				pass: process.env.MAILER_PASSWORD || 'MAILER_PASSWORD'
			}
		}
	},
	billi: {
		sqlConfig: {
			user: 'sa',
			password: 'S@Pa$$123',
			server: 'billi.comprotechnologies.com',
			database: 'Billi',
			connectionTimeout: 900000,
			requestTimeout: 900000,
			options: {
				encrypt: false // Use this if you're on Windows Azure
			}
		}
	},
	sim5: {
		sqlConfig:{
			user: 'sa',
			password: 'S@Pa$$123',
			server: 'billi.comprotechnologies.com',
			database: 'SIMS_Master_V1',
			connectionTimeout: 900000,
			requestTimeout: 900000,
			options: {
				encrypt: false // Use this if you're on Windows Azure
			}
		}
	},
	fileSavePath: '/media/seconddrive/repository/documents/',
    importSeriesPath: '/media/seconddrive/import/series/',
    importSkillIndexPath: '/media/seconddrive/import/skillIndex/'
};
