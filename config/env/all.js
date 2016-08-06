'use strict';

module.exports = {
    app: {
        title: 'MyITLab CMS',
        description: '',
        keywords: ''
    },
    theme: 'blue-grey',
    dbOptions: {
        server: {
            poolSize: 20,
            socketOptions: {keepAlive: 1, connectTimeoutMS: 30000}
        },
        user: '',
        pass: ''
    },
    log: {
        // Can specify one of 'combined', 'common', 'dev', 'short', 'tiny'
        format: ':remote-addr - :user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"',
        // Stream defaults to process.stdout
        // Uncomment to enable logging to a log on the file system
        options: {
            stream: 'access.log'
        }
    },
    logLevel: 'info',
    port: process.env.PORT || 3000,
    templateEngine: 'swig',
    // The secret should be set to a non-guessable string that
    // is used to compute a session hash
    sessionSecret: 'MEAN',
    // The name of the MongoDB collection to store sessions in
    sessionCollection: 'sessions',
    // The session cookie settings
    fileSavePath: '/tmp/test/',
    scenarioRevisionTypeVersion: 2,
    documentApis: [{'categoryCode': 'AUDIO_TIMING_XML', 'module': '../modules/audio.xml.api.module'},
        {'categoryCode': 'AUDIO_TIMING_FILE', 'module': '../modules/audio.timing.api.module'},
        {'categoryCode': 'OTHER', 'module': '../modules/base.document.api.module'}],
    audioXMLCategory: 'AUDIO_TIMING_XML',
    sessionCookie: {
        path: '/',
        httpOnly: true,
        // If secure is set to true then it will cause the cookie to be set
        // only when SSL-enabled (HTTPS) is used, and otherwise it won't
        // set a cookie. 'true' is recommended yet it requires the above
        // mentioned pre-requisite.
        secure: false,
        // Only set the maxAge to null if the cookie shouldn't be expired
        // at all. The cookie will expunge when the browser is closed.
        maxAge: 604800000
        // To set the cookie in a specific domain uncomment the following
        // setting:
        // domain: 'yourdomain.com'
    },
    // The session cookie name
    sessionName: 'connect.sid',
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
    assets: {
        lib: {
            css: [
                'public/css/style-responsive.css',
                'public/lib/components-font-awesome/css/font-awesome.min.css',
                'public/lib/bootstrap/dist/css/bootstrap.min.css',
                'public/lib/owl-carousel/owl-carousel/owl.carousel.css',
                'public/lib/bootstrap-select/dist/css/bootstrap-select.min.css',
                'public/lib/bootstrap-daterangepicker/daterangepicker-bs3.css',
                'public/lib/jquery-nestable/nestable.css',
                'public/lib/jquery-notific8/dist/jquery.notific8.min.css',
                'public/lib/angular-ui-grid/ui-grid.min.css'
            ],
            js: [
                'public/lib/angular/angular.js',
                'public/lib/angular-resource/angular-resource.js',
                'public/lib/angular-animate/angular-animate.js',
                'public/lib/angular-ui-router/release/angular-ui-router.js',
                'public/lib/angular-ui-utils/ui-utils.js',
                'public/lib/angular-bootstrap/ui-bootstrap-tpls.js',
                'public/lib/angular-bootstrap/ui-boostrap.js',
                'public/lib/ng-file-upload/ng-file-upload.js,',
                'public/lib/ng-file-upload/ng-file-upload-shim.js'
            ]
        },
        css: [
            'public/modules/**/css/*.css'
        ],
        js: [
            'public/config.js',
            'public/application.js',
            'public/modules/*/*.js',
            'public/modules/*/*[!tests]*/*.js'
        ],
        tests: [
            'public/lib/angular-mocks/angular-mocks.js',
            'public/modules/*/tests/*.js'
        ]
    },
	appdynamics : {
		'controllerHostName' : '-',
		'accountName' : '-',
		'accountAccessKey' : '-',
		'applicationName' : '-',
		'tierName' : '-',
		'nodeName' : '-',
        'enable' : false,
        'proxyCtrlDir' : '-'
	}
};
