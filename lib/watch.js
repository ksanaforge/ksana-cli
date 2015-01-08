var fs=require("fs");
var firstbuild=true;

var touchksanajs=function(appfolder,fn){
  if (!fs.existsSync(appfolder+fn)) return;
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

  fs.writeFileSync(fn,handler+JSON.stringify(ksana,""," ")+")",'utf8');
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
    touchksanajs(appfolder,"ksana.js");
    if (firstbuild && cbfirstbuildcompleted) {
      cbfirstbuildcompleted();
      cbfirstbuildcompleted=null;//only called once
      firstbuild=false;
    }
  });
  
  bundleShare(b,appfolder);
}

bundleShare=function(b,appfolder) {
  b.transform("reactify").bundle()
    //.pipe(source(appfolder+'index.js'))
   .pipe(fs.createWriteStream(appfolder+"bundle.js"));
  
}
module.exports=browserifyShare;