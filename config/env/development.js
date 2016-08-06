\'use strict';
var DB_HOST = process.env.DB_1_PORT_27017_TCP_ADDR || 'localhost';

module.exports = {
	dbUri: 'mongodb://' + DB_HOST + '/baloo-dev',
	logLevel: 'debug',
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
        }
    },
    sim5: {
        sqlConfig: {
            user: 'billi',
            password: '',
            server: '192.168.2.51',
            database: 'SIMS_Oct_FinalPkg',
            domain: 'COMPRO',
            connectionTimeout: 900000,
            requestTimeout: 900000,
            options: {
                encrypt: false // Use this if you're on Windows Azure
            }
        }
    },
    importSeriesPath: process.env.HOME+'/.baloo/import/series/',
    importSkillIndexPath: process.env.HOME+'/.baloo/import/skillIndex/'
};
