var mongoose = require('mongoose'),
    projectDocumentMigrator = require('./project.document.migrator'),
    Content = mongoose.model('Content'),
    Series = mongoose.model('Series'),
    Project = mongoose.model('Project');

exports.migrateProjectDocuments = function (req, res, next) {
    var seriesIds = req.param('seriesIds').split(',');
    if (seriesIds !== undefined) {
        seriesIds.forEach(function (seriesId) {
            Content.findById(seriesId).exec(function (err, series) {
                if (err) {
                    console.log(err);
                    return next(err);
                }

                series.getChildren({type: "cms_project"}, true, function (err, projects) {

                    if (err) {
                        console.log(err);
                        return next(err);
                    }

                    migrateProject(projects, 0, function (err) {
                        if (err) {
                            console.log(err);
                            return next(err);
                        }

                        console.log("Success");
                        res.sendStatus(200);
                    });
                });
            })
        });
    }
    else {
        console.log("No Series Ids found");
        next();
    }
};

function migrateProject(projects, index, callback) {
    console.log(index);
    var project;
    if (projects.length > index) {
        project = projects[index];
        console.log("Transferring Documents of Project : " + project.title);
        Project.findById(project._id).populate('data.documents.documents.category').populate('data.documents.documents.files')
            .exec(function (err, populatedProject) {
                if (err) {
                    console.log(err);
                    return callback(err);
                }

                projectDocumentMigrator.migrateProjectDocuments(populatedProject, function (err) {
                    if (err) {
                        console.log(err);
                        return callback(err);
                    }

                    index += 1;
                    migrateProject(projects, index, callback);
                });
            });
    }
    else {
        callback(null);
    }
}
