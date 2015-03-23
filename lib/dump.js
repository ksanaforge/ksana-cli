var m="../node_modules/ksana-database/index.js";
var mod=require("path").resolve(process.cwd(),m);
var fs=require("fs");
if (!fs.existsSync(m)) {
  m="../"+m;
  if (!require("fs").existsSync(m)) return;
  mod=require("path").resolve(process.cwd(),m);
}

var kde=require(mod);

var dump=function(kdbid) {
	kde.open(kdbid,function(err,db){
		if (err) {
			console.log("cannot open kdb",kdbid);
		} else {
			db.exportAs.CSV.call(db,function(res){
				fs.writeFileSync(kdbid+".csv",res,"utf8");	
			});
			
		}
	})
}

module.exports=dump;