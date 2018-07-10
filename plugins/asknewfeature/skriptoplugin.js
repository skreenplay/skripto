var babel = require("babel-core");
var fs = require("fs");
var path = require("path");
var process = require("process");
var browserify = require('browserify');

console.log('Welcome to the Skripto Plugin Builder');

/* Config */

var babelOptions = {
  presets: [
    "es2015",
    "react"
  ],
  plugins: [
    "babel-plugin-add-module-exports",
    "transform-react-jsx"
  ]
}

var sourceRel = 'src/';
var destRel = 'plugin/';
var tempRel = 'temp/'




var sourcePath = path.join(process.cwd(), sourceRel);
var destPath = path.join(process.cwd(), destRel);
var tempPath = path.join(process.cwd(), tempRel);


var jsList = []

/* Files sorting and babel */
fs.readdirSync(sourcePath).forEach(file => {
  if (file.endsWith('.js')){
    console.log('Bundling javascript file');
    if (!fs.existsSync(tempPath)) {
      fs.mkdirSync(tempPath);
    }
    var filePath = path.join(sourcePath, file);
    var newfilePath = path.join(tempPath, file);
    var newCode = babel.transformFileSync(filePath, babelOptions).code;
    jsList.push(path.join(tempRel,file));
    fs.writeFileSync(newfilePath, newCode);

  } else if (file==="node_modules"){
    //just in case
  } else {
    if (!fs.existsSync(destPath)) {
      console.log('Creating destination path');
      fs.mkdirSync(destPath);
    }
    fs.copyFileSync(path.join(sourcePath, file), path.join(destPath, file))
  }
});

/* Bundling with browserify */
var b = browserify(jsList, {
  standalone: "Main"
});
var bundlePath = fs.createWriteStream(path.join(destPath, 'plugin.js'));
b.bundle().pipe(bundlePath);



/* Remove temp file */

bundlePath.on('close', function(){
  console.log('Done : everything is in '+"'"+destRel+"'");
  for (var i = 0; i < jsList.length; i++) {
    fs.unlinkSync(jsList[i])
  }
  fs.rmdirSync(tempPath, (err => {
    console.log(err);
  }))
})

/*for (var i = 0; i < jsList.length; i++) {
  fs.unlinkSync(jsList[i])
}
fs.rmdirSync(tempPath, (err => {
  console.log(err);
}))
*/
