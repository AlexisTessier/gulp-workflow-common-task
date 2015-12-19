'use strict';

var path = require('path');

var unindent = require('unindent');

var gulp = require('gulp');
var task = require('./index');

/*--------------------*/

var _package = require('./package');

var example = [
	"var gulp = require('gulp');",
	"var task = require('"+_package.name+"');",
	"",
	"//This example set a babel task",
	"task.babel(gulp, {",
	"	src: [",
	'		path.join(__dirname, "sources/*.js")',
	'		path.join(__dirname, "sources/**/*.js")',
	"	],",
	'	dest: "build/"',
	'});',
	"",
	"//Then set a build and a watch task which\n//automatically use the tasks defined before",

	"task.build(gulp);",
	"task.watch(gulp);"
].join('\n');

var api = [];
for(var methodName in task){
	if(methodName !== 'build' && methodName !== 'watch'){
		api.push('- ['+methodName+'](#task'+methodName.toLowerCase()+')');
	}
}

api.push('\n');

var extractBody = function(func) {
	var entire = func.toString();
	return unindent(unindent(entire.substring(entire.indexOf("{") + 1, entire.lastIndexOf("}"))));
};

for(var methodName in task){
	if(methodName !== 'build' && methodName !== 'watch'){
		api.push('#####task.'+methodName+'\n```javascript\n'+extractBody(task[methodName](false))+'\n```\n----------\n');
	}
}

/*--------------------*/

task.mustache(gulp, {
	src: [
		path.join(__dirname, 'README.mustache')
	],
	view: {
		package: _package,
		username: 'AlexisTessier',
		example: example,
		api: api.join('\n')
	},
	destExt: '.md'
});

/*--------------------*/

task.build(gulp);
task.watch(gulp);

gulp.task('default', ['build']);