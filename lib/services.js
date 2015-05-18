/* edit this file to include new services */

var install_services=function( service_holder) {
	require('ksana-database/rpc_api')(service_holder); 
}

module.exports=install_services;