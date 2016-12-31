var path  = require('path');

var _package = require(path.join(process.cwd(), 'package.json'));

var username = _package.homepage.replace('https://github.com/', '').split('/')[0];
var lowerUsername = username.toLowerCase();
_package.rawName = _package.name.replace('@'+lowerUsername+'/' , '');
var furyiopath = '%40'+lowerUsername+'%2F'+_package.rawName;

module.exports = {
	package: _package,
	furyiopath: furyiopath,
	username: username
};