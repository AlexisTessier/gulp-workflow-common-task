@alexistessier/gulp-workflow-common-task
================

[![version](https://img.shields.io/badge/version-2.1.0-blue.svg)](https://github.com/AlexisTessier/gulp-workflow-common-task#readme)
[![npm version](https://badge.fury.io/js/%40alexistessier%2Fgulp-workflow-common-task.svg)](https://badge.fury.io/js/%40alexistessier%2Fgulp-workflow-common-task)

[![Dependency Status](https://david-dm.org/AlexisTessier/gulp-workflow-common-task.svg)](https://david-dm.org/AlexisTessier/gulp-workflow-common-task)
[![devDependency Status](https://david-dm.org/AlexisTessier/gulp-workflow-common-task/dev-status.svg)](https://david-dm.org/AlexisTessier/gulp-workflow-common-task#info=devDependencies)

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


