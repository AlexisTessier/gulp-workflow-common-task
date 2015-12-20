'use strict';

var assert = require('assert');
var path = require('path');

var _ = require('lodash');
var flatten = require('flat');
var unflatten = flatten.unflatten;

var gulp = require('gulp');
var watch = require('gulp-watch');
var plumber = require('gulp-plumber');
var babel = require('gulp-babel');
var batch = require('gulp-batch');
var mustache = require('gulp-mustache');
var rename = require("gulp-rename");
var sourcemaps = require('gulp-sourcemaps');

var taskList = {};
var buildTaskList = [];

var commonTask = {
	build: function(params) {
		var params = params || {};
		buildTaskList = params.taskList || _.keys(taskList);
		gulp.task('build', buildTaskList);
	},
	watch: function(params) {
		var params = params || {};
		gulp.task('watch', buildTaskList, function () {
			_.forEach(taskList, function(task, name) {
				watch(task.params.src, batch(function (events, done) {
					gulp.start(name, done);
				}));
			});
		});
	},
	'default': function(defaultTask) {
		gulp.task('default', typeof defaultTask === 'string' ? [defaultTask] : (defaultTask || 'build'));
	}
};

/*---------------------*/

var presetCustomKeyCounter = 1;

function _addCommonTask(name, taskSetter, presets){
	assert(typeof presets === 'object');

	var presetsDefault = presets.default || null;
	var defaultParams = typeof presetsDefault === 'object' ? presetsDefault : (
		typeof presetsDefault === 'string' ? (presets[presetsDefault] || null) : null
	);
	assert(typeof defaultParams === 'object' || typeof defaultParams === 'null');

	commonTask[name] = function(preset, paramsOverride, ignore) {
		var _defaultParams = typeof defaultParams === 'null' ? null : _.cloneDeep(defaultParams);
		var presetKey = typeof preset === 'object' ? 'custom-preset-'+(presetCustomKeyCounter++) : (preset || 'default');
		var _preset = typeof preset === 'object' ? preset : _.cloneDeep(presets[presetKey]);

		if(!ignore){
			var taskName = name+'-'+presetKey;
			var paramsOverride = typeof paramsOverride === 'object' ? paramsOverride : {};

			var flatten_params = flatten(_defaultParams || {});
			var flatten_preset = flatten(_preset || {});
			var flatten_override = flatten(paramsOverride);

			for(var key in flatten_preset){
				flatten_params[key] = flatten_preset[key];
			}

			for(var key in flatten_override){
				flatten_params[key] = flatten_override[key];
			}

			var params = unflatten(flatten_params);

			taskList[taskName] = {
				params: params
			};
			taskSetter(taskName, params);
		}
		else{
			return {
				name: name,
				task: setTask,
				presets: presets
			};
		}	
	};
}

/*-------------------------------------------*/

// _addCommonTask('babel', function(taskName, params) {
// 	gulp.task(taskName, function (done) {
// 		gulp.src(params.src)
// 			.pipe(plumber())
// 			.pipe(sourcemaps.init())
// 			.pipe(babel(params.options))
// 			.pipe(sourcemaps.write('.'))
// 			.pipe(gulp.dest(params.dest))

// 			.on('end', function() {
// 				done();
// 			});
// 	});
// }, {
// 	'default': 'es6-for-node',
// 	'es6-for-node': {
// 		src: [
// 			path.join(process.cwd(), "sources/*.js"),
// 			path.join(process.cwd(), "sources/**/*.js")
// 		],
// 		options: {
// 			presets: ['babel-preset-es2015']
// 		},
// 		dest: "build/"
// 	}
// });

/*--------------------------------------------*/

_addCommonTask('mustache', function(taskName, params) {
	gulp.task(taskName, function(done) {
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
	'readme-for-node-package' : {
		src: [
			path.join(process.cwd(), 'README.mustache')
		],
		view: require('./readme-for-node-package.view'),
		destExt: '.md',
		dest: './'
	}
});

module.exports = commonTask;