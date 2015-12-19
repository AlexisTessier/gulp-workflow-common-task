'use strict';

var path = require('path');

var unindent = require('unindent');

var gulp = require('gulp');
var task = require('./index');

/*--------------------*/

var _package = require('./package');
var username = 'AlexisTessier';
var lowerUsername = username.toLowerCase();
_package.rawName = _package.name.replace('@'+lowerUsername+'/' , '');
var furyiopath = '%40'+lowerUsername+'%2F'+_package.rawName;

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

task.mustache(gulp, 'readme-from-mustache');

/*--------------------*/

task.build(gulp);
task.watch(gulp);

gulp.task('default', ['build']);