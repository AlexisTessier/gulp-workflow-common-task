'use strict';

var watch = require('gulp-watch');
var plumber = require('gulp-plumber');
var babel = require('gulp-babel');
var batch = require('gulp-batch');
var mustache = require('gulp-mustache');
var rename = require("gulp-rename");
var sourcemaps = require('gulp-sourcemaps');

var taskList = [];
var taskTarget = {};

module.exports = {
	babel : function(gulp, params) {
		var shortcut = function() {
			gulp.task('babel', function (done) {
				gulp.src(params.src)
					.pipe(plumber())
					.pipe(sourcemaps.init())
					.pipe(babel(params.options || {
						presets: ['babel-preset-es2015']
					}))
					.pipe(sourcemaps.write('.'))
					.pipe(gulp.dest(params.dest || './'))

					.on('end', function() {
						done();
					});
			});
		};

		if(gulp){
			taskList.push('babel');
			taskTarget.babel = params.src;
			shortcut();
		}
		else{
			return shortcut;
		}
	},
	mustache : function(gulp, params) {
		var shortcut = function() {
			gulp.task('mustache', function(done) {
				gulp.src(params.src)
					.pipe(plumber())
					.pipe(mustache(params.view || {}))
					.pipe(rename(function (path) {
					    path.basename = path.basename.replace(params.destExt || '.html', '');
					    path.extname = params.destExt || '.html';
					}))
					.pipe(gulp.dest(params.dest || './'))
					.on('end', function() {
						done();
					});
			});	
		};

		if(gulp){
			taskList.push('mustache');
			taskTarget.mustache = params.src;
			shortcut();
		}
		else{
			return shortcut;
		}
	},
	build: function(gulp, params) {
		var params = params || {};
		gulp.task('build', taskList);
	},
	watch: function(gulp, params) {
		var params = params || {};
		gulp.task('watch', taskList, function () {
			for(var i=0,imax=taskList.length;i<imax;i++){
				var task = taskList[i];

				watch(taskTarget[task], batch(function (events, done) {
					gulp.start(task, done);
				}));
			}
		});
	}
};