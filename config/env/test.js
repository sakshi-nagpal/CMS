'use strict';

var DB_HOST = process.env.DB_1_PORT_27017_TCP_ADDR || 'localhost';

module.exports = {
	dbHost: DB_HOST,
	db:'baloo-test',
	dbUri: 'mongodb://' + DB_HOST + '/baloo-test',
	dbOptions:{
		server: {
			poolSize: 1
		},
		user: '',
		pass: ''
	},
	port: 3001,
	mailer: {
		from: process.env.MAILER_FROM || 'MAILER_FROM',
		options: {
			service: process.env.MAILER_SERVICE_PROVIDER || 'MAILER_SERVICE_PROVIDER',
			auth: {
				user: process.env.MAILER_EMAIL_ID || 'MAILER_EMAIL_ID',
				pass: process.env.MAILER_PASSWORD || 'MAILER_PASSWORD'
			}
		}
	}
};
