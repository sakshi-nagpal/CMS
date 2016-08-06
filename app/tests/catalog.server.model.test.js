'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
    mongoose = require('mongoose'),
    Catalog = mongoose.model('Catalog');

/**
 * Globals
 */
var catalog;

/**
 * Unit tests
 */
describe('Catalog Model Unit Tests:', function() {
    beforeEach(function(done) {
        catalog = new Catalog({
            title: 'Catalog Title',
            series: [{
                title: 'Series 1',
                thumbnail: 'series1.jpg'
            },
            {
                title: 'Series 2',
                thumbnail: 'series2.jpg'
            }]

        });

        done();
    });

    describe('Method Save', function() {
        it('should be able to save without problems', function(done) {
            return catalog.save(function(err) {
                should.not.exist(err);
                done();
            });
        });

        it('should be able to show an error when try to save without title', function(done) {
            catalog.title = '';

            return catalog.save(function(err) {
                should.exist(err);
                done();
            });
        });

        it('should be able to save without series', function(done) {
            catalog.series = '';

            return catalog.save(function(err) {
                should.not.exist(err);
                done();
            });
        });

        it('should be able to show an error when try to save without a series title', function(done) {
            catalog.series[0].title = '';

            return catalog.save(function(err) {
                should.exist(err);
                done();
            });
        });
    });

    afterEach(function(done) {
        Catalog.remove().exec();
        done();
    });
});
