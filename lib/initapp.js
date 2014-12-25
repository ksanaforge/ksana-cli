/*
 create a new app scaffold in working directory
 if ksanafile.js exists, warning user and quit, unless flag -f is set
 read all files in scaffold , replace %% with current directory name

variable in scaffold

_%name%_       default to working foldername
_%giturl%_     read from .git/config/url

passing variable from command line
ksana init --v=xyz
_%v%_ will be replaced with xyz

*/
var default_scaffold="../dev2015-scaffold-default/";
var readdir=require("./readdir");
var mkdirpSync=require("./mkdirp").sync;
var fs=require("fs");
var vars={};
var getgiturl=function() {
	var url=fs.readFileSync('.git/config','utf8');//.match(/url = (.*?)\n/);
	url=url.substr(url.indexOf('url ='),100);
	url=url.replace(/\r\n/g,'\n').substring(6,url.indexOf('\n'));
	return url;
}
var readfiles_replace_var=function(scaffold,files,argv) {
	for (var i=0;i<files.length;i++) {
		var content=fs.readFileSync(scaffold+files[i],"utf8");
		content=content.replace(/_%([^%]+)%_/g,function(m,m1){
			var replaced= argv[m1]||vars[m1];
			return replaced;
		});
		var newpath=require("path").dirname(files[i]);
		if (newpath!=".") {
			mkdirpSync(newpath);
		}
		fs.writeFileSync(files[i],content,"utf8");
	}
}
var getAppName=function(){
	var name=process.cwd();
	var i=name.lastIndexOf("/");
	if (i==-1) i=name.lastIndexOf("\\");
	if (i==-1) return "unknown";
	return name.substr(i+1);
}
var initapp=function(argv,env) {
	if (fs.existsSync("ksanafile.js") && !argv.f){
		console.log("Not an empty folder, use -f to force reinitialized")
	}else {
		var scaffold="../"+argv.s || default_scaffold;
		if (scaffold==default_scaffold) {
			console.log("-s to specify other scaffold");
		}
		if (!fs.existsSync(scaffold)) {
			console.log(scaffold,"not exists");
			return;
		}
		console.log("initializing app using scaffold",scaffold);

		var files=readdir(scaffold);
		vars.name=getAppName();
		vars.giturl=getgiturl();
		readfiles_replace_var(scaffold,files,argv);
		console.log("Application Initialized, npm install to install depedencies.");		
	}
}
module.exports=initapp;