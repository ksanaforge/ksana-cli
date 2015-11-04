/* edit this file to include new services */
var path=require("path");
var fs=require("fs");
var indexerentry="../node_modules/ksana-database/rpc_api.js";
var abspath=path.resolve(process.cwd(),indexerentry);
if (!fs.existsSync(abspath)) {
	indexerentry="../"+indexerentry;
	abspath=path.resolve(process.cwd(),indexerentry);
}
var rpc_api=require(abspath);
var rpc_fs=require("./rpc_fs");
var rpc_util=require("./rpc_util");
var install_services=function( service_holder) {
	rpc_api(service_holder); 
	rpc_fs(service_holder);
	rpc_util(service_holder);
}

module.exports=install_services;