/**
	runs on node, 
*/
var fs=require("fs");

var readFile=function(opts,cb) {
	fs.readFile(opts.filename,opts.enc||"utf8",cb);
}
readFile.async=true;

var writeFile=function(opts,cb) {
	console.log("writing",opts.data.length,"bytes",opts.opts)
	fs.writeFile(opts.filename,opts.data,opts.opts,cb);
}
writeFile.async=true;

var exists=function(opts,cb) {
	var filename=opts;
	if (typeof opts.filename=="string") filename=opts.filename;
	fs.exists(filename,cb);
}
exists.async=true;

var unlink=function(opts,cb) {
	var filename=opts;
	if (typeof opts.filename=="string") filename=opts.filename;
	fs.unlink(filename,cb);
}
unlink.async=true;
var mkdir=function(opts,cb) {
	fs.mkdir(opts.path,opts.mode,cb);
}
mkdir.async=true;
var readdir=function(opts,cb) {
	var path=opts;
	if (typeof opts.path=="string") path=opts.path;

	fs.readdir(path,cb);
}
readdir.async=true;
var rpc=function(service_holder) {
	service_holder["fs"]={readFile:readFile,writeFile:writeFile,exists:exists,unlink:unlink,mkdir:mkdir,readdir:readdir};
	console.log("install FS rpc");
}
module.exports=rpc;