fs=require("fs");
lib=require("../generators/lib.gen.js");
curdir=fs.readdirSync(".");
lib.register_tag("b",function(com_name,inner_html,inner_raw,arg){
	return"<strong>"+inner_html+"</strong>";});
lib.register_tag("i",function(com_name,inner_html,inner_raw,arg){
	return"<em>"+inner_html+"</em>";});
lib.register_tag("u",function(com_name,inner_html,inner_raw,arg){
	console.log("Warning: Do not use underline as it may be confused with hyperlink.\n"+text_linu+"\n");
	return inner_html;});
lib.register_tag("del",function(com_name,inner_html,inner_raw,arg){
	return"<del>"+inner_html+"</del>";});
function url_do(com_name,inner_html,inner_raw,arg){
    let targ="";
	if(typeof(arg)=="undefined")targ=inner_raw;else targ=arg;
	if(com_name=="url")return"<a href=\""+targ+"\">"+inner_html+"</a>";
    else return"<div class=\"posti\"><a href=\""+targ+"\">"+inner_html+"</a></div>";
}
lib.register_tag("url",url_do);lib.register_tag("urlbox",url_do);
lib.register_tag("quote",function(com_name,inner_html,inner_raw,arg){
            if(typeof(arg)=="undefined")return"<blockquote>"+inner_html+"</blockquote>";
            else return"<blockquote><cite>"+make_escape(arg)+": </cite><br>"+inner_html+"</blockquote>";
});
lib.register_tag("img",function(com_name,inner_html,inner_raw,arg){
	return"<img class=\"article-img\" src=\""+inner_html+"\" alt=\"\"/>";
});
lib.register_tag("code",function(com_name,inner_html,inner_raw,arg){
	return"<pre><code>"+inner_html+"</code></pre>";},lib.raw_tag);
lib.register_tag("raw_html",function(com_name,inner_html,inner_raw,arg){
	return inner_raw;},lib.raw_tag);

function htmlize(s){return s.substr(0,s.length-4)+".html";}
for(let i=0;i<curdir.length;i++){
    if(curdir[i].endWith(".txt")){
        console.log("Proceeding BBCODE: "+curdir[i]);
        fs.writeFileSync("../blog/"+htmlize(curdir[i]),
        	lib.proc(fs.readFileSync(curdir[i],"utf8"),htmlize(curdir[i]),fs.statSync(curdir[i]).mtimeMs));
    }else if(/*(!curdir[i].endWith(".gen.js"))&&(curdir[i]!="g")*/true){
        console.log("Copying File: "+curdir[i]);
        fs.writeFileSync("../blog/"+curdir[i],fs.readFileSync(curdir[i]));
    }else console.log("Skipping: "+curdir[i]);
}
fs.writeFileSync("../blog/index.html",lib.proc(lib.make_index(),""));
