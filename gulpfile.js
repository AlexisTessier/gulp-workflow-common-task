'use strict';

var path = require('path');

var unindent = require('unindent');
var task = require('./index');

/*--------------------*/

/*var api = [];
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
}*/

task.mustache('readme-for-node-package');

/*--------------------*/

task.build();
task.watch();

task.default('build');