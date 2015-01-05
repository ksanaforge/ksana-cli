#!/usr/bin/env node
const Liftoff = require('liftoff');
const argv = require('minimist')(process.argv.slice(2));

const Ksana = new Liftoff({
  name: 'ksana',
//  moduleName: 'hacker',     // these are assigned
//  configName: 'hackerfile', // automatically by
//  processTitle: 'hacker',   // the "name" option
  extensions: {'.js':null},
  // ^ automatically attempt to require module for any javascript variant
  // supported by interpret.  e.g. coffee-script / livescript, etc
  nodeFlags: ['--harmony'] // to support all flags: require('v8flags').fetch();
  // ^ respawn node with any flag listed here
}).on('require', function (name, module) {
  console.log('Loading:',name);
}).on('requireFail', function (name, err) {
  console.log('Unable to load:', name, err);
}).on('respawn', function (flags, child) {
  console.log('Detected node flags:', flags);
  console.log('Respawned to PID:', child.pid);
});


var initfolder=function(argv,env) {
  var fs=require("fs");

  if (!fs.existsSync(".git")){
    console.log("The folder should be controlled by git");
    return true;
  } else {
    if (argv._[0]=="init") {
      require("../lib/initapp.js")(argv,env);
      return true;
    } else {
      if (!fs.existsSync("ksana.js")){
        console.log("to initialize ksana app, type");
        console.log("ksana init");
        return false;
      } else {
        return false;
      }
    }
  }
}
var getkdb=function(dbpath,opts) {
  var m="../node_modules/ksana-database/index.js";
  var m=require("path").resolve(process.cwd(),m);
  var paths=dbpath.split(".");
  dbid=fn=paths.shift();
  require(m).open(dbid,function(err,db){
    if (err) {
      console.log(err);
    } else {
      db.get(paths,opts,function(data){
        console.log(data);
      });
    }
  })
}

var invoke=function(env) {
  if (argv.verbose) {
    console.log('LIFTOFF SETTINGS:', this);
    console.log('CLI OPTIONS:', argv);
    console.log('CWD:', env.cwd);
    console.log('LOCAL MODULES PRELOADED:', env.require);
    console.log('SEARCHING FOR:', env.configNameRegex);
    console.log('FOUND CONFIG AT:',  env.configPath);
    console.log('CONFIG BASE DIR:', env.configBase);
    console.log('YOUR LOCAL MODULE IS LOCATED:', env.modulePath);
    console.log('LOCAL PACKAGE.JSON:', env.modulePackage);
    console.log('CLI PACKAGE.JSON', require('../package'));
  }
  var a0=argv._[0], processed=true;
  if (argv._.length==0 || a0=="help") {
    require("../lib/help")(argv,env);
  } else {
    if (initfolder(argv,env)) {
      //completed
    } else {
      if(env.configPath) {
        //console.log(env.configPath)
        process.chdir(env.configBase);
        if (!require("../lib/commands")(argv,env)) {
          processed=false;
        }
      } else {
        console.log("no ksana.js")
        processed=false;
      }    
    }
  }
  if (!processed)  {
    if (a0=="mkdb") {
            require("../lib/mkdb")(argv._[1],argv._[2],argv.c)
    } else {
        getkdb(a0,{recursive:argv.r,address:argv.a}); 
    }

  }

  
}

Ksana.launch({
  cwd: argv.cwd,
  configPath: "ksana.js",//argv.ksanafile ,
  require: argv.require,
  completion: argv.completion,
  verbose: argv.verbose
}, invoke);
