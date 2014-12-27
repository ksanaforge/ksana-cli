var spawn=require("child_process").spawn;
var nwarg=["../node_modules/nodewebkit/bin/nodewebkit",".","--remote-debugging-port=9222"];
var nw={"win32":"..\\node_webkit\\win32\\nw.exe",
        "darwin":"../node_webkit/osx/node-webkit.app/Contents/MacOs/node-webkit"};
var runnw=function() {
	var bin="node";//nw[process.platform];
	var child=spawn(bin,nwarg,{detached:true});
	console.log("debugging url http://127.0.0.1:9222");
	process.exit();
}
var commands=function(argv){
	if (argv._[0]=="nw") {
		runnw();
	}
	console.log("execute command");
}
module.exports=commands;