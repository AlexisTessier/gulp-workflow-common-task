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
var rollup = require('rollup-stream');
var rename = require('gulp-rename');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var flow = require('gulp-flowtype');
var batch = require('gulp-batch');
var mustache = require('gulp-mustache');
var rename = require("gulp-rename");
var sourcemaps = require('gulp-sourcemaps');
var rollupFlow = require('rollup-plugin-flow');
var uglify = require('gulp-uglify');
var nodeResolve = require('rollup-plugin-node-resolve');
var commonjs = require('rollup-plugin-commonjs');

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
	name = _.camelCase(name);
	assert(typeof presets === 'object');

	var presetsDefault = presets.default || null;
	var defaultParams = typeof presetsDefault === 'object' ? presetsDefault : (
		typeof presetsDefault === 'string' ? (presets[presetsDefault] || null) : null
	);
	assert(typeof defaultParams === 'object' || typeof defaultParams === 'null');

	commonTask[name] = function(preset, paramsOverride, disable) {
		var _defaultParams = typeof defaultParams === 'null' ? null : _.cloneDeep(defaultParams);
		var presetKey = typeof preset === 'object' ? 'custom-preset-'+(presetCustomKeyCounter++) : (preset || 'default');
		var _preset = typeof preset === 'object' ? preset : _.cloneDeep(presets[presetKey]);

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

		if(!disable){
			taskList[taskName] = {
				params: params
			};
			taskSetter(taskName, params);
		}

		return {
			name: name,
			task: taskSetter,
			presets: presets,
			params: params
		};	
	};
}

/*-------------------------------------------*/

var babelEs6ForNodeComputedParams = {
	src: [
		path.join(process.cwd(), "sources/**/*.js")
	]
};

babelEs6ForNodeComputedParams.src.documentationDescription = '[path.join(process.cwd(), "sources/\*\*/\*.js")]';

_addCommonTask('babel', function(taskName, params) {
	gulp.task(taskName, function (done) {
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
		src: babelEs6ForNodeComputedParams.src,
		options: {
			presets: ['babel-preset-es2015']
		},
		dest: "build/"
	}
});

/*--------------------------------------------*/

var moduleBuildFlowtypeJsdoc3RollupEs6UglifyComputedParams = {
	src: {
		documentationDescription: '[path.join(process.cwd(), "sources/\*\*/\*.js")]',
		value: [
			path.join(process.cwd(), "sources/**/*.js")
		],
		__is_gulp_workflow_common_task_computed_parameters: true
	},
	typesDeclarationsPath: {
		documentationDescription: 'path.join(process.cwd(), "sources/types")',
		value: path.join(process.cwd(), "sources/types"),
		__is_gulp_workflow_common_task_computed_parameters: true
	},
	entry: {
		documentationDescription: 'path.join(process.cwd(), "sources/index.js")',
		value: path.join(process.cwd(), "sources/index.js"),
		__is_gulp_workflow_common_task_computed_parameters: true
	}
};

var moduleId = require('./cwd-package-computed-data').package.rawName;
_addCommonTask('module-build', function(taskName, params) {
	for(var paramName in params){
		var param = params[paramName];
		if(_.isObject(param) && param.__is_gulp_workflow_common_task_computed_parameters === true){
			params[paramName] = param.value;
		}
	}
	params.options.flow.declarations = params.typesDeclarationsPath;
	
	params.options.rollup.plugins = _.isArray(params.options.rollup.plugins) ? params.options.rollup.plugins : [];
	params.options.rollup.plugins.unshift(commonjs(params.options.commonjs));
	params.options.rollup.plugins.unshift(nodeResolve(params.options.nodeResolve));
	params.options.rollup.plugins.unshift(rollupFlow(params.options.flow));

	gulp.task(taskName, function (done) {
		gulp.src(params.src)
			.pipe(plumber())
			.pipe(flow(params.options.flow))
			.on('end', function() {

				var stream = rollup(_.assign({}, {
			    	entry: params.entry,
			    	sourceMap: true
				}, params.options.rollup))
				.pipe(source(path.basename(params.entry), path.dirname(params.entry)))
				.pipe(buffer())
				.pipe(plumber())
				.pipe(sourcemaps.init({loadMaps: true}))
				.pipe(babel(params.options.babel))

				if(params.uglify === true){
					stream = stream.pipe(uglify(params.options.uglify));
				}
				
				stream.pipe(rename(params.outputName))
				.pipe(sourcemaps.write('.'))
				.pipe(gulp.dest(params.dest))
				.on('end', function() {
					done();
				});
			});
	});
}, {
	'default': 'flowtype-jsdoc3-rollup-es6-uglify',
	'flowtype-jsdoc3-rollup-es6-uglify': {
		entry: moduleBuildFlowtypeJsdoc3RollupEs6UglifyComputedParams.entry,
		src: moduleBuildFlowtypeJsdoc3RollupEs6UglifyComputedParams.src,
		typesDeclarationsPath: moduleBuildFlowtypeJsdoc3RollupEs6UglifyComputedParams.typesDeclarationsPath,
		outputName:'bundle.js',
		uglify: true,
		options: {
			commonjs: {
				include: 'node_modules/**',
				exclude: [],
				extensions: ['.js'],
				namedExports: {}
			},
			rollup : {
				format: 'umd',
				moduleId: moduleId,
				moduleName: _.upperFirst(_.camelCase(moduleId)),
				indent: false
			},
			nodeResolve : {
				module: true,
				jsnext: true,
				main: true,
				skip: [],
				extensions: [ '.js', '.json' ],
				preferBuiltins: true,
				browser: true
			},
			uglify: {},
			flow: {
				all: false,
				weak: false,
				killFlow: false,
				beep: true,
				abort: false
			},
			babel: {
				presets: ['es2015']
			}
		},
		dest: "build/"
	}
});

/*--------------------------------------------*/

var readmeForNodePackageComputedParams = {
	src: [
		path.join(process.cwd(), "README.mustache")
	],
	view: require('./cwd-package-computed-data')
};

readmeForNodePackageComputedParams.src.documentationDescription = '[path.join(process.cwd(), "README.mustache")]';
readmeForNodePackageComputedParams.view.documentationDescription = 'Some computed values: '+_.keys(readmeForNodePackageComputedParams.view);

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
		src: readmeForNodePackageComputedParams.src,
		view: readmeForNodePackageComputedParams.view,
		destExt: '.md',
		dest: './'
	}
});

module.exports = commonTask;