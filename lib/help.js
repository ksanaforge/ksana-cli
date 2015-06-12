var help=function(argv,env){
	var msg="server mode:"
		+"\n>ks server"
		+"\n\nnodewebkit mode:"
		+"\n>ks nw"
		+"\n\nretrieve content of kdb, path seperated by ."
		+"\n>ks kdb_filename path.field"
		+"\n\nbuild database from glob pattern, read [kdb_fn].js as setting by default"
		+"\n>ks mkdb kdb_fn *.xml|lst_fn -c other_setting.js"
		+"\n\ndump kdb to csv and revision history"
		+"\n>ks dump kdb_fn"
		+"\n\ncheck XML"
		+"\n>ks *.xml"
		+"\n\nExtract innerText enclosed by tag"
		+"\n>ks *.xml tag"
		+"\n\nExtract value of attr, tag is omittable"
		+"\n>ks *.xml tag@attr"

	console.log(msg);
}
module.exports=help;