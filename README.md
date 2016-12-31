@alexistessier/gulp-workflow-common-task
================

[![version](https://img.shields.io/badge/version-2.6.0-blue.svg)](https://github.com/AlexisTessier/gulp-workflow-common-task#readme)
[![npm version](https://badge.fury.io/js/%40alexistessier%2Fgulp-workflow-common-task.svg)](https://badge.fury.io/js/%40alexistessier%2Fgulp-workflow-common-task)

[![Dependencies Status](https://david-dm.org/AlexisTessier/gulp-workflow-common-task.svg)](https://david-dm.org/AlexisTessier/gulp-workflow-common-task)
[![devDependencies Status](https://david-dm.org/AlexisTessier/gulp-workflow-common-task/dev-status.svg)](https://david-dm.org/AlexisTessier/gulp-workflow-common-task#info=devDependencies)

[Home Page](https://github.com/AlexisTessier/gulp-workflow-common-task#readme)

A set of common gulp task I use

Purpose
-------

Reuse some gulp tasks through projects

Install
-------

```
npm install @alexistessier/gulp-workflow-common-task
```

How to use
----------

```javascript
var path = require('path');

var task = require('@alexistessier/gulp-workflow-common-task');

//Set a task named babel-es6-for-node
//Set a babel task, with the "es6-for-node" preset
task.babel('es6-for-node');

//Set a task named mustache-readme-for-node-package
//Set a mustache task, with the "readme-for-node-package" preset and custom params
task.mustache('readme-for-node-package', {
	'view.myCustomData': 'Hello world'
});

//Then the build and watch tasks can be defined like that
task.build();
task.watch();

task.default('build');
```

Common tasks list
-----------------

- [babel](#taskbabel)
- [moduleBuild](#taskmodulebuild)
- [mustache](#taskmustache)

#####task.babel
```javascript

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

```

Available presets

- es6-for-node (default)

	param|type|description or default value
	--------|--------|--------
	src|object|[path.join(process.cwd(), "sources/**/*.js")]
	options|object|{"presets":["babel-preset-es2015"]}
	dest|string|"build/"



#####task.moduleBuild
```javascript

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

gulp.task('moduleBuild', function (done) {
	gulp.src(params.entry)
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
		})
		.on('error', done)
});

```

Available presets

- flowtype-jsdoc3-rollup-es6-uglify (default)

	param|type|description or default value
	--------|--------|--------
	entry|object|path.join(process.cwd(), "sources/index.js")
	src|object|[path.join(process.cwd(), "sources/**/*.js")]
	typesDeclarationsPath|object|path.join(process.cwd(), "sources/types")
	outputName|string|"bundle.js"
	uglify|boolean|true
	options|object|{"commonjs":{"include":"node_modules/**","exclude":[],"extensions":[".js"],"namedExports":{}},"rollup":{"format":"umd","moduleId":"gulp-workflow-common-task","moduleName":"GulpWorkflowCommonTask","indent":false},"nodeResolve":{"module":true,"jsnext":true,"main":true,"skip":[],"extensions":[".js",".json"],"preferBuiltins":true,"browser":true},"uglify":{},"flow":{"all":false,"weak":false,"killFlow":false,"beep":true,"abort":false},"babel":{"presets":["es2015"]}}
	dest|string|"build/"



#####task.mustache
```javascript

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

```

Available presets

- readme-for-node-package

	param|type|description or default value
	--------|--------|--------
	src|object|[path.join(process.cwd(), "README.mustache")]
	view|object|Some computed values: package,furyiopath,username
	destExt|string|".md"
	dest|string|"./"


