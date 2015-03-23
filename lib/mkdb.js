var fs=require("fs");
var mkdbconfig={
	meta:{
		config:"simple1"
	}
	,pageSeparator:"pb.n"
}
var mkdb=function(kdbid,glob,config) {
	var path=require("path");
	var indexerentry="../node_modules/ksana-indexer/index.js";
	var abspath=path.resolve(process.cwd(),indexerentry);
	if (!fs.existsSync(abspath)) {
		indexerentry="../"+indexerentry;
		abspath=path.resolve(process.cwd(),indexerentry);
	}
	var indexer=require(abspath);
	if (!kdbid) {
		console.log("syntax:")
		console.log("ks mkdb kdb *.xml|*.csv")
		return;
	}
	kdbid=kdbid.replace(".kdb","");
	if (config) config=config.replace(".js","");
	var mkdbconfigfn=(config||kdbid)+".js";
	if (fs.existsSync(mkdbconfigfn)){
		console.log("config file:",mkdbconfigfn);
		var userconfig=require(path.resolve(process.cwd(),mkdbconfigfn));
		//merge default config
		for (var i in mkdbconfig) if (!userconfig[i]) userconfig[i]=mkdbconfig[i];
		mkdbconfig=userconfig;
	} else {
		console.log("default config",mkdbconfig);
	}
	if (config) {
		for (var i in config) {
			mkdbconfig[i]=config[i];
		}
	}
	if (glob) {
		mkdbconfig.glob=glob;
	}
	if (!mkdbconfig.name) mkdbconfig.name=kdbid;
	indexer.build(mkdbconfig);
}
module.exports=mkdb;
