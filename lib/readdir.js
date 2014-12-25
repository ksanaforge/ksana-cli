//modified from https://github.com/fs-utils/fs-readdir-recursive/blob/master/index.js
var fs = require('fs');
var path = require('path');


var readdir_recursively=function(root, filter, files, prefix) {
  prefix = prefix || '';
  files = files || [];
  filter = filter || noDotFiles;

  var dir = path.join(root, prefix);
  if (fs.statSync(dir).isDirectory()) {
    fs.readdirSync(dir)
    .filter(filter)
    .forEach(function (name) {
      readdir_recursively(root, filter, files, path.join(prefix, name));
    });
  } else {
    files.push(prefix);
  }

  return files;
}

function noDotFiles(x) {
  return x[0] !== '.'
}

module.exports = readdir_recursively;