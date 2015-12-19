'use strict';

var assert = require('assert');
var path = require('path');

var watch = require('gulp-watch');
var plumber = require('gulp-plumber');
var babel = require('gulp-babel');
var batch = require('gulp-batch');
var mustache = require('gulp-mustache');
var rename = require("gulp-rename");
var sourcemaps = require('gulp-sourcemaps');

var taskList = [];
var taskTarget = {};

var commonTask = {
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

function addCommonTask(name, task, presets){
	assert(typeof presets === 'object');
	assert(typeof presets.default === 'string' || typeof presets.default === 'object');
	var defaultParams = typeof presets.default === 'object' ? presets.default : presets[presets.default];
	assert(typeof defaultParams === 'object');

	commonTask[name] = function(gulp, params) {
		var params = typeof params === "object" ? params : (
			presets[params] || defaultParams
		);

		for(var key in defaultParams){
			params[key] = (typeof params[key] !== 'undefined' && typeof params[key] !== 'null') ? params[key] : defaultParams[key];
		}

		if(gulp){
			taskList.push(name);
			taskTarget[name] = params.src;
			task(gulp, params);
		}
		else{
			return task;
		}	
	};
}

/*-------------------------------------------*/

addCommonTask('babel', function(gulp, params) {
	gulp.task('babel', function (done) {
		gulp.src(params.src)
			.pipe(plumber())
			.pipe(sourcemaps.init())
			.pipe(babel(params.options))
			.pipe(sourcemaps.write('.'))
			.pipe(gulp.dest(params.dest))

			.on('end', function() {
				done();
			});
	});
}, {
	'default': 'es6-for-node',
	'es6-for-node': {
		src: [
			path.join(process.cwd(), "sources/*.js"),
			path.join(process.cwd(), "sources/**/*.js")
		],
		options: {
			presets: ['babel-preset-es2015']
		},
		dest: "build/"
	}
});

/*----------------------*/

addCommonTask('mustache', function(gulp, params) {
	gulp.task('mustache', function(done) {
		gulp.src(params.src)
			.pipe(plumber())
			.pipe(mustache(params.view))
			.pipe(rename(function (path) {
				path.basename = path.basename.replace(params.destExt, '');
				path.extname = params.destExt;
			}))
			.pipe(gulp.dest(params.dest))
			.on('end', function() {
				done();
			});
	});	
}, {
	'default' : ''
	'r' : {
		src: [
			path.join(__dirname, 'README.mustache')
		],
		view: {
			package: _package,
			username: username,
			api: api.join('\n'),
			furyiopath: furyiopath
		},
		destExt: '.md'
	}
});

module.exports = commonTask;