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
var out_all=[];

var finalize=function() {
	out_all.sort(function(a,b){return b[0]-a[0]});
	console.log(out_all.join("\n"));
}
var getTagInner=function(content) {
	if (this.tag.substr(0,1)==="*") return getTagDist.call({tag:this.tag.substr(1),fn:this.fn},content);
	var reg=new RegExp("<"+this.tag+"(.*?)>(.*?)</"+this.tag+">","g");
	return parseContent(content,reg);
}
var getTagAttr=function(content) {
	var reg=new RegExp("<"+this.tag+".*?"+this.attr+"=\"(.*?)\"+.*?>","g");
	return parseContent(content,reg);
}

var getTagDist=function(content) {
	var tag=this.tag||"",fn=this.fn;
	var regex=new RegExp("<"+tag+".*?>","g");
	var last=0,lasttag="_";
	content.replace(regex,function(m,idx){
		out_all.push([idx-last,lasttag,fn]);
		lasttag=m;
		last=idx;
	})
	out_all.push([content.length-last,lasttag,fn]);
}

var getAttr=function(content) {
	var reg=new RegExp("<.*?"+this.attr+"=\"(.*?)\"+.*?>","g");
	return parseContent(content,reg);	
}
var tagActions=function(tag,attr,fn) {
	if (tag&& !attr) {
		return getTagInner.bind({tag:tag,fn:fn});
	}
  if (tag && attr) {
  	return getTagAttr.bind({tag:tag,attr:attr,fn:fn})
  }

  if (attr && !tag) {
  	return getAttr.bind({tag:tag,attr:attr,fn:fn})	
  }

	return nop;
}
var actionBySelector=function(selector,fn) {
	if (!selector) return statistic;
	var attrat=selector.indexOf("@");
	var attr;

	if (attrat>-1) {
		attr=selector.substr(attrat+1);
		selector=selector.substr(0,attrat);
	}

	var tag=selector;
	return tagActions(tag,attr,fn);
}
var nofn=false;
var dofile=function(fn,selector) {
	if (!nofn) console.log(fn);
	var action=actionBySelector(selector,fn);
	var content=fs.readFileSync(fn,"utf8");
	var res=action(content);
	if (res) console.log(res);
}

var doXML=function(fn,selector) {
	console.time("doxml");
	if (selector && selector.substr(0,1)==="*") nofn=true;
	require("glob")(fn,function(err,files){
		if (files.length) {
			for (var i=0;i<files.length;i++) {
				dofile(files[i],selector);
			}
		}
		else console.log("file not found",fn);
		finalize();
		console.timeEnd("doxml");
	});
}
module.exports=doXML;