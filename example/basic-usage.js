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