var maxoffset=512,maxline=4;


var id={};

module.exports=function(content) {
	var lines=content.split(/\r?\n/);
	var line,segid;
	var lastline=0,lastoffset=0,offset=0;

	var getsegid=function() {
		var stack=[];
		for (var i=0;i<tocstack.length;i++) {
			stack.unshift(tocstack[i]);
		}
		return stack.join(".");
	}

	var tocstack=[];

	for (var i=0;i<lines.length;i++) {
		line=lines[i];

		line.replace(/<h(\d)[^>]*?>(.*?)</g,function(m,m1,head){
			var depth=parseInt(m1);
			tocstack[depth-1]=head;
			tocstack.length=depth;
		});

		if ((offset-lastoffset>maxoffset || i-lastline>maxline) && line[0]=="<"
			&& line[1]=="h") {

			segid=getsegid();
			if (id[segid]) {
				console.log(line,lines[i-1])
				console.log("repeat id "+segid+" file:"+this.fn+" line:"+i+1);
				throw "repeat id"
			}
			id[segid]=true;
			lines[i]='<_ id="'+segid+'"/>\n'+line;

			lastoffset=offset;
			lastline=i;
		} else {
			//use deepest head
			if (i-lastline<maxline) {
				if (!(line[0]=="<" && line[1]=="h")) {
					var newid=getsegid();

					if (!id[newid] && segid && newid.length>segid.length) {
						lines[lastline]=lines[lastline].replace(/<_ id="(.*?)"\/>/,function(m,m1){
							return '<_ id="'+newid+'"/>';
						});
						delete id[segid];
						id[newid]=true;
					}
				}
			}
		}
		offset+=line.length+1;
	}
	var outfn=this.fn+".autoseg";
	console.log("writing",outfn);
	console.log(Object.keys(id));
	require("fs").writeFileSync(outfn,lines.join("\n"),"utf8");
}