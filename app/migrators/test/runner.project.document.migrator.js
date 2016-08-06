'use strict';

var mongoose = require('mongoose'),
    fs = require('fs');

mongoose.connect('mongodb://localhost/baloo-dev');

var models_path = '../../models'
fs.readdirSync(models_path).forEach(function (file) {
    if (~file.indexOf('.js')) require(models_path + '/' + file)
})

var Project = mongoose.model('Project');

var projectDocumentMigrator = require('../projectDocumentMigrator/project.document.migrator');

console.log(process.env.NODE_ENV);

Project.findById("5593c6afd7cf7324000cca8a").populate('data.documents.documents.category').populate('data.documents.documents.files')
    .exec(function (err, project) {
        projectDocumentMigrator.migrateProjectDocuments(project, function (err) {
            if (err) console.log(err);

            console.log('success');
        });

    });

