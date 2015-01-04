var help=function(argv,env){
	var msg="server mode:"
		+"\n>ks server"
		+"\nnodewebkit mode:"
		+"\n>ks nw"
		+"\nretrieve content of kdb, path seperated by ."
		+"\n>ks kdb_filename path.field"
		+"\nbuild database from glob pattern, read [kdb_fn].js as setting by default"
		+"\n>ks mkdb kdb_fn *.xml|lst_fn -c other_setting.js"

	console.log(msg);
}
module.exports=help;