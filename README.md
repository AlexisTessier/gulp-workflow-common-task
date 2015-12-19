@alexistessier/gulp-workflow-common-task [![master version](https://img.shields.io/badge/master%20version-1.0.3-blue.svg)](https://github.com/AlexisTessier/gulp-workflow-common-task#readme)
================

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

Use one of task you want to define.

```javascript
var gulp = require('gulp');
var task = require('@alexistessier/gulp-workflow-common-task');

//This example set a babel task
task.babel(gulp, {
	src: [
		path.join(__dirname, "sources/*.js")
		path.join(__dirname, "sources/**/*.js")
	],
	dest: "build/"
});

//Then set a build and a watch task which
//automatically use the tasks defined before
task.build(gulp);
task.watch(gulp);
```

Task list
---------

- [babel](#taskbabel)
- [mustache](#taskmustache)


#####task.babel
```javascript

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

```
----------

#####task.mustache
```javascript

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

```
----------
