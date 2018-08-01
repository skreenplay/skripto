const React = require('react');
const pathlib = window.require('path');
var Module = window.require('module');
var process = window.require('process');
const fs = window.require('fs');
const vm = require('vm');



function getAvailablePlugins() {
  var pluginTree = {
    Toolbar: [

    ],
    Editor: [

    ],
    Global: [

    ]
  }
  var pluginsPath = pathlib.join(process.resourcesPath, "plugins/")
  if (fs.existsSync(pluginsPath)) {
    console.log('found plugins path');
  } else {
    var pluginsPath = pathlib.join('/Applications/Skripto.app/Contents/Resources/', "plugins/") // only for dev
  }

  fs.readdirSync(pluginsPath).forEach(function(folder) {
    if (folder!==".DS_Store"){
      var plPlugin = pathlib.join(pluginsPath, folder);

      if (fs.existsSync(plPlugin)){
        fs.readdirSync(plPlugin).forEach(function(item) {
          // required files
          var manifestFile = pathlib.join(plPlugin, "manifest.json")
          var pluginFile = pathlib.join(plPlugin, "plugin.js")
          if (fs.existsSync(manifestFile) & fs.existsSync(pluginFile) ) {
            if (item==="manifest.json") {
              var manifestFile = pathlib.join(plPlugin, item)
              var config = JSON.parse(fs.readFileSync(manifestFile));
              if (config.where) {
                for (var i = 0; i < config.where.length; i++) {
                  var itemwhere = config.where[i];
                  var newPlugin = config;
                  newPlugin.path = pathlib.join(plPlugin,"plugin.js")
                  if (!pluginTree[itemwhere]) {
                    pluginTree[itemwhere] = []
                  }
                  pluginTree[itemwhere].push(newPlugin);
                }
              }
            }
          } else {
            console.error("One of the required files doesn't exist. Check out documentation at https://github.com/skreenplay/skripto/docs/plugins.md");
          }
        });
      } else {
        console.error('Plugin could not be found at : ' , plPlugin);
      }
    }
  });
  return pluginTree
}

function pluginFromPath(path) {
  var code = "(function(exports){"+String(fs.readFileSync(path))+"}(module.exports));"; //wrap in this function to enable script's exports
  var script = new vm.Script(code);
  var context = vm.createContext({
    React:React,
    Component:React.Component,
    module:{},
    console:console,
    imports: {
      path:require('path'),
      fetch:fetch,
      JSON:JSON,
    }
  })
  try {
    let res = script.runInContext(context);
  } catch (e) {
    console.error('Error while running the plugin : ', path);
  }

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
  pluginFromPath,
  getAvailablePlugins
}
