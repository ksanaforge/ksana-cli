var spawn=require("child_process").spawn;
var nwarg=["../node_modules/nodewebkit/bin/nodewebkit",".","--remote-debugging-port=9222"];
var runnw=function() {
	var bin="node";
	require("./watch")(process.cwd()+require("path").sep,function(){
		var child=spawn(bin,nwarg,{detached:false});
		console.log("debugging url http://127.0.0.1:9222");
		child.on("close",function(code){
			console.log("node webkit is closed.");
			process.exit();
		});
	});
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
var commands=function(argv){
	var a0=argv._[0];
	if (a0=="nw") {
		runnw();
	} else if (a0=="server"){
		require("./server");
	} else if (a0=="mkdb"){
		require("./mkdb")(argv._[1],argv._[2],argv.c);
	} else {
		getkdb(a0,{recursive:argv.r,address:argv.a});
	}
}
module.exports=commands;