/*
 create a new app scaffold in working directory
 if ksana.js exists, warning user and quit, unless flag -f is set
 read all files in scaffold , replace %% with current directory name

variable in scaffold

_%name%_       default to working foldername
_%giturl%_     read from .git/config/url

passing variable from command line
ksana init --v=xyz
_%v%_ will be replaced with xyz

*/
var scaffold_prefix="../node_modules/ksana2015-scaffold-";
var default_scaffold="default";
var readdir=require("./readdir");
var mkdirpSync=require("./mkdirp").sync;
var fs=require("fs");
var chalk=require("chalk");
var vars={};
var getgitrawbaseurl=function(gitrepo) {
	//"https://github.com/ksanaforge/test2.git"
	var repo= gitrepo.replace("https:","http:")
	.replace("github.com","rawgit.com")
	.replace(".git","/master/");

	if (repo.indexOf("/master/")==-1) {
		repo+="/master/";
	}
	return repo;

	/// "baseurl":"http://rawgit.com/ksanaforge/test2/master/",	
}

var getgiturl=function() {
	var url=fs.readFileSync('.git/config','utf8');//.match(/url = (.*?)\n/);
	url=url.substr(url.indexOf('url ='),100);
	url=url.replace(/\r\n/g,'\n').substring(6,url.indexOf('\n'));
	return url;
}
var getrawgiturl=function() {
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
			if (m1[0]=="{" && m1[m1.length-1]=="}") {
				try {
					var replaced=eval(m1);	
				} catch (e) {
					console.log("error evaluating",m1);
					console.log("in",scaffold+files[i]);
					console.error(e);
				}
			}
			
			return replaced;
		});
		var newpath=require("path").dirname(files[i]);
		if (newpath!=".") {
			mkdirpSync(newpath);
		}
		var writeok=true;
		if (fs.existsSync(files[i])) {
			var oldcontent=fs.readFileSync(files[i],"utf8");
			if (oldcontent!=content && !argv.f) {
				console.log(files[i],chalk.bgRed.bold("is modified, add -f to force overwrite."));
				writeok=false;				
			}
		}
		if (writeok) fs.writeFileSync(files[i],content,"utf8");
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
	var scaffold=scaffold_prefix+ (argv.s || default_scaffold)+"/";
	if (argv.s==default_scaffold) {
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
	vars.rawgit=getgitrawbaseurl(getgiturl());
	readfiles_replace_var(scaffold,files,argv);
	console.log(chalk.green("Application Initialized, npm install to install depedencies."));
}
module.exports=initapp;