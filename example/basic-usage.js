var path = require('path');

var task = require('@alexistessier/gulp-workflow-common-task');

//This set a task named babel-es6-for-node
task.babel('es6-for-node');

//Then the build and watch asks can be defined like that
task.build();
task.watch();

task.default('build');