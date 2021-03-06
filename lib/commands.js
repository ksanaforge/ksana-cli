var spawn=require("child_process").spawn;
var nwjsarg=["../node_modules/nw/bin/nw",".","--remote-debugging-port=9222"];
var nwarg=["../node_modules/nodewebkit/bin/nodewebkit",".","--remote-debugging-port=9222"];
var runnw=function(arg) {
	var bin="node";
	require("./watch")(process.cwd()+require("path").sep,function(){
		var child=spawn(bin,arg,{detached:false});
		console.log("debugging url http://127.0.0.1:9222");
		child.on("close",function(code){
			console.log("node webkit is closed.");
			process.exit();
		});
	});
}
var commands=function(argv){
	var a0=argv._[0];
	if (a0=="nw") {
		runnw(nwjsarg);
	} else if (a0=="server"){
		require("./server");
	} else {
		return false;
	}
	return true;
}

module.exports=commands;