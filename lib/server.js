var fs=require('fs');
var http=require('http');
var url = require('url');
var path = require('path');
//var restart=require('./restart');//restart helper
var rpc_node=require('./rpc_node');
/*
offline application
  <html manifest="offline.appcache" 
	chrome://appcache-internals/ 
	http://appcachefacts.info/
*/  

var spawn = require('child_process').spawn;
var argv = require("minimist")(process.argv.slice(2));

var port= parseInt(argv.port|| argv.p || "2556"); 
var appendhtml=false;


if (argv.help) {
	console.log("--port ");
	console.log("--cwd ");
	return;
}

function dirExistsSync (d) {
try { return fs.statSync(d).isDirectory() }
  catch (er) { return false }
 }
 var getMIMEType=function(ext) {
	var mimeTypes = {
	    "html": "text/html",
	    "htm": "text/html",
	    "jpeg": "image/jpeg",
	    "jpg": "image/jpeg",
	    "png": "image/png",
	    "svg": "image/svg+xml",
	    "js": "application/javascript",
	    "appcache": "text/cache-manifest",
	    "css": "text/css"
	};
 	return mimeTypes[ext] || 'application/octet-stream';
 }
var servestatic=function(filename,stat,req,res) {
	var ext=filename.substring(filename.lastIndexOf("."));
	var etag = stat.size + '-' + Date.parse(stat.mtime);
	var nocache=(req.connection.remoteAddress=='127.0.0.1') || 
	(ext=='.js' || ext=='.tmpl' || ext==".appcache" || ext==".kdb" || ext==".map");
	var statuscode=200;
	if(!nocache && req.headers['if-none-match'] === etag) {
		res.statusCode = 304;
		res.end();
	} else {
	 	var range=null, opts={};
	 	if (req.headers.range) range=req.headers.range.match(/bytes=(\d+)-(\d+)/);
		
		var mimeType = getMIMEType(path.extname(filename).split(".")[1]);
		var header={"Content-Type":mimeType, "Content-Length":stat.size};
	 	if (range) {
	 		opts={start:parseInt(range[1]),end:parseInt(range[2])};
	 		var totalbytes=opts.end-opts.start+1;
	 		header["Content-Length"]=opts.end-opts.start+1;
	 		//header["Content-Range"]='bytes ' + opts.start + '-' + opts.end + '/' + totalbytes;
	 		//header["Accept-Ranges"]='bytes';
	 		statuscode=200;
	 	}
	 	header['Last-Modified']=stat.mtime;
		if ( nocache) {
			//console.log('serving no cache file '+filename);
		} else {
			//console.log('serving file '+filename);
			header['ETag']= etag;
		}
		if (req.method=="HEAD") {
			res.writeHead(statuscode, header);
			res.end();
		} else {
			var s=fs.statSync(filename);
			if (range){
				if (opts.end>=s.size) opts.end=s.size-1;
				header["Content-Length"]=opts.end-opts.start+1;
			}
			res.writeHead(statuscode, header);
			var fileStream = fs.createReadStream(filename,opts);
			fileStream.pipe(res);			
		}
	}
}

var appfolder=process.cwd()+require("path").sep;

var startserver=function(home) {
	if (argv.cwd) {
		process.chdir(argv.cwd);
	} else if (home) {
		process.chdir(home);
	}
	
  var httpd=http.createServer(function(req, res) {
  	/*
		if (req.method=="POST") {
			res.writeHead(200);
			req.on('data', function(chunk) {
			  res.write(chunk);
			});
			 req.on('end', function() {
				
				res.end("ok");
			 });
		}
		*/
		var uri = url.parse(req.url).pathname;

		appendhtml=false;
		if (uri[uri.length-1]=='/') {
			//var newbase=uri.substr(1,uri.length-2);
			uri+='index.html';
			appendhtml=true;
		}		
		if (req.url=='/quit') {
			process.exit();
		}

		var filename = path.join(process.cwd(), uri);
		// deal with missing / for foldername
		if (dirExistsSync(filename) && filename[filename.length-1]!='/' && !appendhtml) {
			res.statusCode = 302;
			console.log('redirect to '+uri+"/");
			res.setHeader("Location", uri+"/");
			res.end();
			return;			
		}
		fs.stat(filename, function(err,stat) {
			if(!stat) {
				//console.log("Not exists: " + filename);
				res.writeHead(200, {'Content-Type': 'text/plain'});
				res.write('404 Not Found \n'+filename);
				res.end();
				return;
			}
			servestatic(filename,stat,req,res);
			
 
		}); //end path.exists
	}).listen(port,"0.0.0.0");
	console.log("home dir",process.cwd(),"listening port",port);
	var slash=appfolder.substr(0,appfolder.length-1).lastIndexOf(require("path").sep);
	console.log("http://127.0.0.1:"+port+"/"+appfolder.substring(slash+1,appfolder.length-1));
	rpc_node(httpd);  //enable server side API, pass in httpd server handle
}

process.on('uncaughtException', function(err) {
  console.log('excerption',err);
  console.trace();
  //rpc_node.finalize();
});

var start=function() {
	startserver("..");
}
var startwatch=function() {
	require("./watch")(appfolder);
	start();
}

if (argv._[0]==="server") {
	startwatch();
} else if (argv._.length==0) {
	start();
}

module.exports={startwatch:startwatch,start:start};