'use strict';

module.exports = function (grunt) {
    // Unified Watch Object
    var watchFiles = {
        serverViews: ['app/views/**/*.*'],
        serverJS: ['gruntfile.js', 'server.js', 'config/**/*.js', 'app/**/*.js', '!app/tests/'],
        clientViews: ['public/modules/**/views/**/*.html', 'public/modules/**/directives/**/*.html', '!public/modules/**/directives/ngCkeditor/**/*.html'],
        clientJS: ['public/appRoutes.js', 'public/config.js', 'public/constants.js', 'public/modules/**/*.js', '!public/modules/**/directives/ngCkeditor/**/*.js'],
        clientCSS: ['public/modules/**/*.css', '!public/modules/**/directives/ngCkeditor/**/*.css'],
        clientLess: ['public/modules/**/*.less', 'public/less/**/*.less'],
        mochaTests: ['app/tests/**/*.js'],
        routesJS: ['public/appRoute.js', 'public/modules/**/config/*routes.js']
    };

    // Project Configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            serverViews: {
                files: watchFiles.serverViews,
                options: {
                    livereload: true
                }
            },
            serverJS: {
                files: watchFiles.serverJS,
                tasks: ['jshint'],
                options: {
                    livereload: true
                }
            },
            clientViews: {
                files: watchFiles.clientViews,
                tasks: ['html2js'],
                options: {
                    livereload: true
                }
            },
            clientJS: {
                files: watchFiles.clientJS,
                tasks: ['jshint'],
                options: {
                    livereload: true
                }
            },
            clientCSS: {
                files: watchFiles.clientCSS,
                tasks: ['csslint'],
                options: {
                    livereload: true
                }
            },
            clientLess: {
                files: watchFiles.clientLess,
                tasks: ['less'],
                options: {
                    livereload: true
                }
            },
            mochaTests: {
                files: watchFiles.mochaTests,
                tasks: ['test:server']
            },
            routesJS: {
                files: watchFiles.routesJS,
                tasks: ['concat'],
                options: {
                    livereload: true
                }
            }
        },
        html2js: {
            options: {
                htmlmin: {
                    collapseBooleanAttributes: true,
                    collapseWhitespace: true,
                    removeAttributeQuotes: true,
                    removeComments: true,
                    removeEmptyAttributes: true,
                    removeRedundantAttributes: true
                },
                quoteChar: '\'',
                rename: function (moduleName) {
                    return moduleName.replace(/^.*[\\\/]/, '');
                }
            },
            main: {
                src: watchFiles.clientViews,
                dest: 'public/templates.js'
            }
        },
        concat: {
            options: {
                //separator: ';'
                banner: '\'use strict\';\n',
                process: function (src, filepath) {
                    return '// Source: ' + filepath + '\n' +
                        src.replace(/(^|\n)[ \t]*('use strict'|"use strict");?\s*/g, '$1');
                }
            },
            dist: {
                src: watchFiles.routesJS,
                dest: 'public/routes.js'
            }
        },
        jshint: {
            all: {
                src: [watchFiles.clientJS.concat(watchFiles.serverJS), '!public/modules/itemEditor/directives/itemEditor.client.directive.js'],
                options: {
                    jshintrc: true
                }
            }
        },
        csslint: {
            options: {
                csslintrc: '.csslintrc'
            },
            all: {
                src: watchFiles.clientCSS
            }
        },
        uglify: {
            production: {
                options: {
                    mangle: false
                },
                files: {
                    'public/dist/application.min.js': 'public/dist/application.js'
                }
            }
        },
        cssmin: {
            combine: {
                files: {
                    'public/dist/application.min.css': '<%= applicationCSSFiles %>'
                }
            }
        },
        nodemon: {
            dev: {
                script: 'server.js',
                options: {
                    nodeArgs: ['--debug'],
                    ext: 'js,html',
                    watch: watchFiles.serverViews.concat(watchFiles.serverJS)
                }
            }
        },
        'node-inspector': {
            custom: {
                options: {
                    'web-port': 1337,
                    'web-host': 'localhost',
                    'debug-port': 5858,
                    'save-live-edit': true,
                    'no-preload': true,
                    'stack-trace-limit': 50,
                    'hidden': []
                }
            }
        },
        ngAnnotate: {
            production: {
                files: {
                    'public/dist/application.js': '<%= applicationJavaScriptFiles %>'
                }
            }
        },
        concurrent: {
            default: ['nodemon', 'watch'],
            debug: ['nodemon', 'watch', 'node-inspector'],
            options: {
                logConcurrentOutput: true,
                limit: 10
            }
        },
        env: {
            test: {
                NODE_ENV: 'test'
            },
            secure: {
                NODE_ENV: 'secure'
            }
        },
        mochaTest: {
            src: watchFiles.mochaTests,
            options: {
                reporter: 'spec',
                require: 'server.js'
            }
        },
        karma: {
            unit: {
                configFile: 'karma.conf.js'
            }
        },
        mocha_istanbul: {
            target: {
                src: watchFiles.mochaTests,
                options: {
                    coverageFolder: 'coverage_report/back_end',
                    coverage: true,
                    noColors: true,
                    dryRun: false,
                    print: 'detail',
                    check: {
                        lines: 1
                    },
                    excludes: ['test/excluded*.js', 'config/env/*.js', 'server.js', 'app/migrators/**/*.js',
                        'app/util/*.js', 'config/loggers/*.js', 'app/controllers/scenarioReverseMigrator.server.controller.js'],
                    mochaOptions: ['--bail', '--debug-brk'],
                    istanbulOptions: ['--default-excludes'],
                    reporter: 'xunit-file',
                    captureFile: '/xunit.xml',
                    require: 'server.js',
                    reportFormats: ['cobertura', 'lcov']
                }
            }
        },
        istanbul_check_coverage: {
            default: {
                options: {
                    coverageFolder: 'coverage_report*', // will check both coverage folders and merge the coverage results
                    check: {
                        branch: 80,
                        statements: 80,
                        functions: 80
                    }
                }
            }
        },
        less: {
            compress: {
                options: {
                    paths: [],
                    compress: false,
                    relativeUrls: true,
                    rootpath: '../modules'
                },
                files: {
                    'public/css/themes/blue-grey.css': 'public/less/themes/style2/blue-grey.less',
                    'public/css/themes/pink-blue.css': 'public/less/themes/style2/pink-blue.less',
                    'public/css/themes/red-dark.css': 'public/less/themes/style2/red-dark.less',
                    'public/css/style-responsive.css': 'public/less/style-responsive.less'
                }
            }
        },
        mongoimport: {
            options: {
                db: '<%=db.name%>',
                host: '<%=db.host%>', //optional
                port: '27017', //optional
                stopOnError: false,  //optional
                collections: [
                    {
                        name: 'capabilities',
                        type: 'json',
                        file: 'test_data/capabilities.json',
                        jsonArray: true,
                        upsert: true,
                        drop: true
                    },
                    //{ name: 'catalogs', type: 'json', file: 'test_data/catalogs.json',jsonArray: true, upsert: true, drop: true},
                    {
                        name: 'contents',
                        type: 'json',
                        file: 'test_data/contents.json',
                        jsonArray: true,
                        upsert: true,
                        drop: true
                    },
                    //{ name: 'officeversions', type: 'json', file: 'test_data/officeversions.json',jsonArray: true, upsert: true, drop: true },
                    {
                        name: 'roles',
                        type: 'json',
                        file: 'test_data/roles.json',
                        jsonArray: true,
                        upsert: true,
                        drop: true
                    },
                    {
                        name: 'methodtypeenums',
                        type: 'json',
                        file: 'test_data/methodtypeenums.json',
                        jsonArray: true,
                        upsert: true,
                        drop: true
                    },
                    {
                        name: 'scenariophaseenums',
                        type: 'json',
                        file: 'test_data/scenariophaseenums.json',
                        jsonArray: true,
                        upsert: true,
                        drop: true
                    },
                    //{ name: 'scenarios', type: 'json', file: 'test_data/scenarios.json',jsonArray: true, upsert: true, drop: true },
                    {
                        name: 'documentcategories',
                        type: 'json',
                        file: 'test_data/documentcategories.json',
                        jsonArray: true,
                        upsert: true,
                        drop: true
                    },
                    {
                        name: 'scenariotypeenums',
                        type: 'json',
                        file: 'test_data/scenariotypeenums.json',
                        jsonArray: true,
                        upsert: true,
                        drop: true
                    }
                    //{ name: 'skillIndex', type: 'json', file: 'test_data/skillIndex.json',jsonArray: true, upsert: true, drop: true},
                    //{ name: 'skills', type: 'json', file: 'test_data/skills.json',jsonArray: true, upsert: true, drop: true},
                    //{ name: 'users', type: 'json', file: 'test_data/users.json',jsonArray: true, upsert: true, drop: true},
                ]
            }
        },
        nexusDeployer: {
            release: {
                options: {
                    groupId: "myitlab.baloo",
                    artifactId: "baloo-core",
                    version: '<%=buildVersion%>-SNAPSHOT',
                    packaging: 'zip',
                    classifier: '',
                    auth: {
                        username: 'myit.builder',
                        password: 'C3ompr0#1'
                    },
                    url: 'https://devops-tools.pearson.com/nexus-deps/content/repositories/snapshots',
                    artifact: 'dist/baloo.zip',
                    cwd: ''
                }
            }
        },
        zip_directories: {
            irep: {
                files: [{
                    filter: 'isDirectory',
                    expand: true,
                    src: ['./', '!**/*.zip'],
                    dest: './dist'
                }]
            }
        },
        rename: {
            main: {
                files: [
                    {src: ['dist/.zip'], dest: 'dist/baloo.zip'}
                ]
            }
        },
        clean: ["dist/*"],
        bumpup: {
            options: {
                updateProps: {
                    pkg: 'package.json',
                    bower: 'bower.json'
                }
            },
            setters: {
                version: function (old, releaseType, options) {
                    return grunt.option("release");
                },
                gitRevision: function () {
                    return grunt.config.get('git-revision');
                }
            },
            files: ['package.json', 'bower.json']
        },
        "git-rev-parse": {
            build: {
                options: {
                    prop: 'git-revision',
                    number: 6
                }
            }
        },
        lcovMerge: {
            options: {
                emitters: ['file'],
                outputFile: 'coverage_report/mergeLcov.info'
            },
            src: ['coverage_report/back_end/*.info', 'coverage_report/front_end/*/*.info']
        }
    });

    // Load NPM tasks
    require('load-grunt-tasks')(grunt);

    grunt.loadNpmTasks('grunt-mocha-istanbul');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-rename');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-nexus-deployer');
    grunt.loadNpmTasks('grunt-zip-directories');
    grunt.loadNpmTasks('grunt-bumpup');
    grunt.loadNpmTasks('grunt-lcov-merge');

    // Making grunt default to force in order not to break the project.
    //grunt.option('force', true);

    grunt.registerTask('set_force_on',
        'force the force option on if needed',
        function () {
            if (!grunt.option('force')) {
                grunt.config.set('usetheforce_set', true);
                grunt.option('force', true);
            }
        });

    grunt.registerTask('set_force_off',
        'turn force option off if we have previously set it',
        function () {
            if (grunt.config.get('usetheforce_set')) {
                grunt.option('force', false);
            }
        });

    grunt.event.on('coverage', function (content, done) {
        console.log(content.slice(0, 15) + '...');
        done();
    });

    // A Task for loading the configuration object
    grunt.task.registerTask('loadConfig', 'Task that loads the config into a grunt option.', function () {

        var init = require('./config/init')();
        var config = require('./config/config');
        var pkg = require('./package.json');

        //Add a comment
        grunt.config.set('applicationJavaScriptFiles', config.assets.js);
        grunt.config.set('applicationCSSFiles', config.assets.css);
        grunt.config.set('buildVersion', pkg.version);

        if (process.env.NODE_ENV === 'test') {
            grunt.config.set('db.name', config.db);
            grunt.config.set('db.host', config.dbHost);
        }
    });

    // Primary task(s).
    grunt.registerTask('default', ['set_force_on', 'preprocessor', 'lint', 'concurrent:default']); //used in development environment to start the application
    grunt.registerTask('build', ['set_force_on', 'bumpup', 'preprocessor']); //sets the release version of package json and bower json to the specified version "grunt build --release=<version_number>"
    grunt.registerTask('nexusDeploy', ['set_force_on', 'loadConfig', 'nexusDeployer']); //deploys the zip to the nexus repository, uses the version available in package json
    grunt.registerTask('test', ['env:test', 'set_force_on', 'test:all']); //runs all the unit tests...to be used in development environment
    grunt.registerTask('test_jenkins', ['env:test', 'set_force_off', 'test:all']); //runs all the unit tests..to be used in jenkins job
    grunt.registerTask('package', ['set_force_on', 'preprocessor', 'zipApp']);

    // Supporting task.
    grunt.registerTask('preprocessor', ['concat', 'html2js', 'less']);
    grunt.registerTask('lint', ['jshint', 'csslint']);
    grunt.registerTask('test:all', ['loadConfig', 'mongoimport', 'preprocessor', 'test:server', 'test:client']);
    grunt.registerTask('test:server', ['env:test', 'mocha_istanbul']);
    grunt.registerTask('zipApp', ['clean', 'zip_directories', 'rename']);
    grunt.registerTask('test:client', ['env:test', 'karma:unit']);
    grunt.registerTask('testServer', ['env:test', 'mochaTest']);

};
