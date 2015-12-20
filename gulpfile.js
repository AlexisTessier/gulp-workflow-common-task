'use strict';

var path = require('path');
var fs = require('fs');

var task = require('./index');

/*--------------------*/

task.mustache('readme-for-node-package', {
	'view': {
		example: {
			basicUsage: fs.readFileSync('./example/basic-usage.js', {encoding: 'utf-8'})
		},
		apiDocumentation: require('./api-documentation-generation')
	}
});

/*--------------------*/

task.build();
task.watch();

task.default('build');