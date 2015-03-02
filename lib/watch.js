var fs=require("fs");
var firstbuild=true;
var handler="jsonp_handler(";
var fn="ksana.js";

var loadksanajs=function(appfolder) {
  if (!fs.existsSync(appfolder+fn)) {
    console.log(appfolder+fn,"does not exist!");
    return;
  }
  
  var content=fs.readFileSync(appfolder+fn,"utf8");
  content=content.replace("})","}");
  content=content.replace(handler,"");
  var ksana=JSON.parse(content);
  return ksana;
}
var writeksanajs=function(appfolder,ksana) {
  fs.writeFileSync(appfolder+"ksana.js",handler+JSON.stringify(ksana,""," ")+")",'utf8');
}
var touchksanajs=function(appfolder){
  ksana=loadksanajs(appfolder);
  var filedates=[],filesizes=[];
  if (!ksana || !ksana.files) return;
  if (ksana.files.indexOf("ksana.js")==-1) {
    ksana.files.push("ksana.js");
  }
  ksana.files.forEach(function(f){
    var slash=f.lastIndexOf("/");
    if (slash) {
      f=f.substring(slash+1);
    }
    if (!fs.existsSync(appfolder+f)) {
       console.log("missing ",appfolder+f,"in",appfolder+fn);
       return;
    };
    var stat=fs.statSync(appfolder+f);
    filedates.push( stat.mtime);
    filesizes.push( stat.size);
  });

  ksana.filesizes=filesizes;
  ksana.filedates=filedates;
  ksana.date=new Date();
  ksana.build=parseInt(ksana.build||"1")+1;

  writeksanajs(appfolder,ksana);
}
var getExternalDep=function(appfolder) {
  var ksana=loadksanajs(appfolder);
  return ksana &&ksana.browserify &&ksana.browserify.external;
}
browserifyShare=function(appfolder,cbfirstbuildcompleted){
  // you need to pass these three config option to browserify
  var browserify=require("browserify");
  var watchify=require("watchify");
  var b = browserify(appfolder+'index.js',{
    cache: {},
    packageCache: {},
    fullPaths: true,
    debug:true,
    builtins: false,
    commondir: false,
    detectGlobals: false,
  });//.external("react").external("bootstrap"); //react and bootstrap included in index html
  var externals=getExternalDep(appfolder)||[];
  if (externals.length) console.log("browserify external dependencies:",externals);
  externals.map(function(e){b.external(e)});

  console.log("watching",appfolder+"index.js")
  //b.add(appfolder+'index.js');
  b = watchify(b);
  b.on('update', function(){
    bundleShare(b,appfolder);
  });
  
  b.on("log", function(msg) {
    console.log(appfolder+"bundle.js, "+msg);
    setTimeout(function(){
      touchksanajs(appfolder);  
    },1000);//wait for bundle.js to save
    if (firstbuild && cbfirstbuildcompleted) {
      cbfirstbuildcompleted();
      cbfirstbuildcompleted=null;//only called once
      firstbuild=false;
    }
  });
  
  bundleShare(b,appfolder);
}

bundleShare=function(b,appfolder) {
  
  /*
  var browserify=require("browserify");
  var b = browserify(appfolder+'index.js',{
    cache: {},
    packageCache: {},
    fullPaths: true,
    debug:true,
    builtins: false,
    commondir: false,
    detectGlobals: false,
  });
  var externals=getExternalDep(appfolder)||[];
  if (externals.length) console.log("browserify external dependencies:",externals);
  externals.map(function(e){b.external(e)});
*/
  var exorcist=require("exorcist");
  //var UglifyJS=require("uglify-js");
  //var minmapfile=appfolder+"bundle.js.map";
  //var jsfile=appfolder+"bundle.js";
  //var minjsfile=appfolder+"bundle.min.js";

  var reactify=require("./reactify");
  b.transform(reactify).bundle()
  //.pipe(source(appfolder+'index.js'))
  //.pipe(exorcist(mapfile))
  //.pipe(fs.createWriteStream(appfolder+"bundle.js"));
  
  .pipe(exorcist(appfolder+"bundle.js.map"))
  .pipe(fs.createWriteStream(appfolder+"bundle.js"));

/*
  .on('data', function (chunk) {
    data += chunk;
  })
  .on('end', function () {    
    fs.writeFileSync(jsfile,data,"utf8");
    data = UglifyJS.minify(data, {
      fromString: true,
      warnings: false,
      mangle:null,
      inSourceMap: mapfile,
      outSourceMap: minmapfile
    });
    //remove sourcemapping url with absolute path
    var sourcemapindex=data.code.indexOf("//# sourceMappingURL=");
    data.code=data.code.substr(0,sourcemapindex-1);
    
    var js = data.code + '\n//# sourceMappingURL=bundle.js.map';
        
    fs.writeFile(minjsfile, js,"utf8");
    
    var oldMap = require(mapfile);
    var map = JSON.parse(data.map);
    map.sourcesContent = oldMap.sourcesContent;
    map = JSON.stringify(map);
    fs.writeFile(minmapfile, map);
    fs.unlink(mapfile);
    
  });
  
  */
  
}
module.exports=browserifyShare;