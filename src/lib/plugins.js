const React = require('react');
const pathlib = window.require('path');
var Module = window.require('module');
var process = window.require('process');
const fs = window.require('fs');
const vm = require('vm');
const util = require('util');


function pluginFromPath(path) {
  var code = "(function(exports){"+String(fs.readFileSync(path))+"}(module.exports));";
  var script = new vm.Script(code);
  var context = vm.createContext({
    React:React,
    Component:React.Component,
    exports:{},
    module:{},
    console:console
  })
  let res = script.runInContext(context);
  console.log(context);
  return context.Main;
}



function requireFromString(code, filename, opts) {
	if (typeof filename === 'object') {
		opts = filename;
		filename = undefined;
	}

	opts = opts || {};
	filename = filename || '';

	opts.appendPaths = opts.appendPaths || [];
	opts.prependPaths = opts.prependPaths || [];

	if (typeof code !== 'string') {
		throw new Error('code must be a string, not ' + typeof code);
	}

	var paths = Module._nodeModulePaths(pathlib.dirname(filename));
  paths.push(pathlib.join(process.resourcesPath, 'plugins/lib/'));

	var parent = module.parent;
	var m = new Module(filename, parent);
	m.filename = filename;
	m.paths = [].concat(opts.prependPaths).concat(paths).concat(opts.appendPaths);
  console.log(m.builtinModules);
	m._compile(code, filename);

	var exports = m.exports;
	parent && parent.children && parent.children.splice(parent.children.indexOf(m), 1);

	return exports;
};

module.exports = {
  requireFromString,
  pluginFromPath
}
