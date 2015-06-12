var fs=require("fs");

var statistic=function(content) {
	var tagcount=0,tags={},out=[];
	content.replace(/<(.+?)>/g,function(m,m1){
		var space=m1.indexOf(" ");
		if (space>-1) {
			m1=m1.substr(0,space);
		}
		if (!tags[m1]) tags[m1]=0;
		tags[m1]++;
		tagcount++;
	});
	for (var i in tags) {
		out.push([i,tags[i]]);
	}
	out.sort(function(a,b){return b[1]-a[1]});
	return out.join("\n")+"\ntagcount:"+tagcount;
}
var nop=function(content) {
	console.log("length:",content.length);
}

var parseContent=function(content,regex) {
	var out=[];
	content.replace(regex,function(m,m1,m2){
		out.push(m);
	})
	return out.join("\n");	
}
var getTagInner=function(content) {
	var reg=new RegExp("<"+this.tag+"(.*?)>(.*?)</"+this.tag+">","g");
	return parseContent(content,reg);
}
var getTagAttr=function(content) {
	var reg=new RegExp("<"+this.tag+".*?"+this.attr+"=\"(.*?)\"+.*?>","g");
	return parseContent(content,reg);
}

var getAttr=function(content) {
	var reg=new RegExp("<.*?"+this.attr+"=\"(.*?)\"+.*?>","g");
	return parseContent(content,reg);	
}
var tagActions=function(tag,attr) {
	if (tag&& !attr) {
		return getTagInner.bind({tag:tag});
	}
  if (tag && attr) {
  	return getTagAttr.bind({tag:tag,attr:attr})
  }

  if (attr && !tag) {
  	return getAttr.bind({tag:tag,attr:attr})	
  }

	return nop;
}
var actionBySelector=function(selector) {
	if (!selector) return statistic;
	var attrat=selector.indexOf("@");
	var attr;

	if (attrat>-1) {
		attr=selector.substr(attrat+1);
		selector=selector.substr(0,attrat);
	}

	var tag=selector;
	return tagActions(tag,attr);
}

var dofile=function(fn,selector) {
	console.log(fn);
	var action=actionBySelector(selector);
	var content=fs.readFileSync(fn,"utf8");
	var res=action(content);
	console.log(res);
}

var doXML=function(fn,selector) {
	require("glob")(fn,function(err,files){
		if (files.length) {
			for (var i=0;i<files.length;i++) {
				dofile(files[i],selector);
			}
		}
		else console.log("file not found",fn);
	});
}
module.exports=doXML;