var _ = require('lodash');
var unindent = require('unindent');

var task = require('./index');
var apiTaskList = _.omit(task, ['build', 'watch', 'default']);

var extractFunctionBody = function(func) {
	var entire = func.toString();
	return unindent(unindent(entire.substring(entire.indexOf("{") + 1, entire.lastIndexOf("}"))));
};

var apiHeader = [], apiBody = [];
_.forEach(apiTaskList, function(method, methodName) {
	apiHeader.push('- ['+methodName+'](#task'+methodName.toLowerCase()+')');

	var taskDescriptor = task[methodName](false, false, /*disable*/ true);

	apiBody.push('#####task.'+methodName);
	apiBody.push('```javascript');
	apiBody.push(extractFunctionBody(taskDescriptor.task).replace('taskName', "'"+taskDescriptor.name+"'"));
	apiBody.push('```\n');
	apiBody.push("Available presets\n");

	_.forEach(_.omit(taskDescriptor.presets, 'default'), function(preset, presetName) {
		apiBody.push('- '+presetName+(taskDescriptor.presets.default === presetName ? " (default)" : "")+'\n');
		apiBody.push('\tparam|type|description or default value');
		apiBody.push('\t--------|--------|--------');

		for(var param in preset){
			var paramValue = preset[param];
			var paramType = typeof paramValue;

			apiBody.push('\t'+param+'|'+paramType+'|'+(paramType === 'object' ? (paramValue.documentationDescription || JSON.stringify(paramValue)) : (
				paramType === 'string' ? '"'+paramValue+'"' : (
					paramType === 'function' ? extractFunctionBody(paramValue) : paramValue
				)
			)));
		}
	});

	apiBody.push('\n\n');
});

module.exports = apiHeader.join('\n')+'\n\n'+apiBody.join('\n');