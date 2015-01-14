var fs=require("fs");
var firstbuild=true;

var touchksanajs=function(appfolder,fn){
  if (!fs.existsSync(appfolder+fn)) {
    console.log(appfolder+fn,"does not exist");
    return;
  }
  var handler="jsonp_handler(";
  var content=fs.readFileSync(appfolder+fn,"utf8");
  content=content.replace("})","}");
  content=content.replace(handler,"");
  var ksana=JSON.parse(content);
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

  fs.writeFileSync(appfolder+fn,handler+JSON.stringify(ksana,""," ")+")",'utf8');
}
browserifyShare=function(appfolder,cbfirstbuildcompleted){
  // you need to pass these three config option to browserify
  var browserify=require("browserify");
  var watchify=require("watchify");
  var b = browserify({
    cache: {},
    packageCache: {},
    fullPaths: true,
    debug:true,
    builtins: false,
    commondir: false,
    detectGlobals: false,
  });
  console.log("watching",appfolder+"index.js")
  b.add(appfolder+'index.js');
  b = watchify(b);
  b.on('update', function(){
    bundleShare(b,appfolder);
  });
  b.on("log", function(msg) {
  	console.log(appfolder+"bundle.js, "+msg);
    setTimeout(function(){
      touchksanajs(appfolder,"ksana.js");  
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
  var exorcist=require("exorcist");
  //var UglifyJS=require("uglify-js");
  var mapfile=appfolder+"bundle-map.json";
  var minmapfile=appfolder+"bundle.js.map";
  var jsfile=appfolder+"bundle.js";
  var minjsfile=appfolder+"bundle.min.js";
  var data="";
  b.transform("reactify").bundle()
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