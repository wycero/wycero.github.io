//define startWith and endWith
String.prototype.startWith=function(s){return(new RegExp("^"+s)).test(this);}
String.prototype.endWith=function(s){return(new RegExp(s+"$")).test(this);}

var ss="";
var cur=0;
var len=0;
var raw_mode=false;
var sta=["root"];
var sta2=[["root",[]]];
var raws={
   // "raw_html":1,"code":1,"$":1
   "*":-1
}
var fine="";
var meta="";
var bookmarx=[];
var lin=0;var col=0;
var tagfun={}
var raw_tag=1;var nopair_tag=-1;
// Finish the subtree, returns false when the whole tree is proceeded
function text_linu(){return "In file"+fine+",line "+lin+", col "+col;}
function collapse(){
    if(sta.length==1)return false;
    sta2[sta.length-2].push(sta2[sta.length-1]);
    sta2.pop();sta.pop();
    if(raws[sta[sta.length-1]]==1)raw_mode=true;else raw_mode=false;
    return true;
}
function make_error(s){
    return "<html><body><h1 style=\"color:red\">ERROR</h1><p>"
        +s+"</p><br>"+"<p>"+text_linu()+"</p>"+"</body></html>";
}
// This is a tool func. Make it global
make_escape=function(s){
    let t="";
    for(let i=0;i<s.length;i++){
        if(s[i]=="\"")t+="&quot;";
        else if(s[i]==" ")t+=" ";
        else if(s[i]=="&")t+="&amp;";
        else if(s[i]=="<")t+="&lt;";
        else if(s[i]==">")t+="&gt;";
        else t+=s[i];
    }
    return t;
}
function has_quote(s){
    for(let i=0;i<s.length;i++)if(s[i]=="\"")return true;
    return false;
}
function rep_str(s,tim){if(tim<1)return"";else return s+rep_str(s,tim-1);}
function rec_proc(s){
    let tt="";
    let ttraw="";
    if(s.length==0)return make_error("Empty array(This is an internal error.)");
    let las_li=false;
    for(let i=2;i<s.length;i++){
        if((typeof(s[i]))=="string"){
            if(s[0]=="code")tt+=make_escape(s[i]);
            else{
                if(s[i]=="\n"){
                        tt+="<br>\n";
                }else tt+=make_escape(s[i]);
            }
            ttraw+=s[i];
        }else if(s[i][0]=="*"){
            if(las_li)tt+="</li><li>";else{
                tt+="<li>";las_li=1;
            }
        }else tt+=rec_proc(s[i]);
    }
    if(tagfun[s[0]]!=undefined)return tagfun[s[0]](s[0],tt,ttraw,s[1]);
    else switch(s[0]){
        case"root":{
            let tit="";
            if(meta!=undefined&&typeof(meta.title)=="string")
                tit=make_escape(meta.title);
            let bookht="";
            if(bookmarx.length>0){
                bookht+="<a href=\"javascript:;\" onclick=\"javascript:hit_content();\" class=\"close-content\">关闭目录</a><br>";
            }
            for(let i=0;i<bookmarx.length;i++){
                let lev=bookmarx[i][0];let v=bookmarx[i][1];
                bookht+="<a href=\"#bm"+(i+1)+"\" onclick=\"javascript:hit_content();\">"+rep_str("&nbsp;",6*(lev-1))+v.trim()+"</a><br>";
            }
            let ret="<!DOCTYPE html><html><title>"+tit+` - Wycero's Blog</title>
        <meta charset="UTF-8">
        <link rel="stylesheet" type="text/css" href="../res/wycero-1.css">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.10.0-rc.1/katex.min.css">
        <script src="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.10.0-rc.1/katex.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.10.0-rc.1/contrib/auto-render.js"></script>
        <link href="http://cdn.bootcss.com/highlight.js/8.0/styles/monokai_sublime.min.css" rel="stylesheet">
        <script src="http://cdn.bootcss.com/highlight.js/8.0/highlight.min.js"></script>
        <script >hljs.initHighlightingOnLoad();</script>
        <body id="body">
	<div class="bg-overlay"></div>
        <div class="top-bar">
        <a href="index.html" class="tpi icon-top"><img src="../res/home.svg" class="svg"></img></a>
        <p class="tpi">`+tit+`</p>
        <a href="javascript:;" onclick="javascript:hit_content();" class="tpi icon-top"><img src="../res/top.svg" class="svg"></img></a></div>
        <br><br><br><br>`;
        if(tit!="Home")ret+=`<div class="article">`+tt+`</div>`;
        else ret+=tt;
        if(bookht!="")ret+=`<nav id="table-content">`+bookht+`</nav>`;
        ret+=`<footer>
        <script src="../res/wycero-1.js"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.2.228/pdf.js"></script>
        <p>Copyright `+new Date().getFullYear()+` wycero</p>
        <p>Powered By:
        <a href="http://php.net">PHP</a>
        <a href="https://katex.org">$\\KaTeX$</a>
        <a href="https://highlightjs.org/">Highlightjs</a></p>
        <p>Hosted On github.io</p>
        </footer>
        <script>
            renderMathInElement(document.body,
           {
                      delimiters: [
                          {left: "$$", right: "$$", display: true},
                          {left: "$", right: "$", display: false}
                      ]
                  }
          );
        </script>`+"</body></html>";
        return ret;}
        case"$":{return"$"+tt+"$";}
        case"*":{
        	//TODO: * is built in so deeply. Refract it.
        	return;}
        case"list":{
            if(typeof(s[1])=="undefined")return"<ul>"+tt+"</ul>";
            else return"<ol start=\""+s[1]+"\">"+tt+"</ol>";
        }
        default:{
            console.log("Warning: Unknown Tag: "+s[0]+"\n"+text_linu+"\n");
            return "["+s[0]+"]"+tt+"[/"+s[0]+"]";}
    }
}
pages=[];
function arr_proc(s){
    if(meta==undefined||meta.filename=="");else{
        pages.push(meta);
    }
    return rec_proc(s);
}
function proc(s,filename,date){
	fine=filename;
	// Get rid of Mac and DOS format
	s=s.replace(/\n\r/g,"\n");s=s.replace(/\r/g,"\n");
	// Do some init
    ss="";cur=0;len=0;
    raw_mode=false;
    sta=["root"];
    sta2=[["root",[]]];
    bookmarx=[];
    meta=undefined;
    ss=s;cur=0;
    len=ss.length;
    lin=1;col=1;
    las=0;
    while(cur<len){
    	//Keep track of line number
    	for(let i=las;i<cur;i++)if(ss[i]=="\n")col++;else lin++;las=cur;
        if(ss[cur]=="["){
            if(raw_mode){
                // Only Checks if this tag ends, regardless of anything else
                if(sta.length&&cur+sta[sta.length-1].length+3<len
                    &&ss.substr(cur,sta[sta.length-1].length+3)
                    =="[/"+sta[sta.length-1]+"]"){
                    cur+=sta[sta.length-1].length+3;
                    if(!collapse())return arr_proc(sta2[0]);
                }
                else{
                    sta2[sta.length-1].push(ss[cur]);cur++;
                }
            }else{
                if(cur+1>=len)return make_error("Expected tag or escape, but found EOF");
                if(cur+1<len&&(ss[cur+1]=="["||ss[cur+1]=="]"||ss[cur+1]=="@")){
                    sta2[sta.length-1].push(ss[cur+1]);cur+=2;
                }else{
                    cur++;
                    let tag="";
                    let arg="";let argon=false;
                    while(true){
                        if(cur>=len)return make_error("Expected tag, but found EOF");
                        if(argon){
                            if(ss[cur]=="\\"){
                                if(cur+1<len){
                                    if(ss[cur+1]=="x"||ss[cur+1]=="u")
                                        return make_error("x/u escape is not supported");
                                    let es="\"\\"+ss[cur+1]+"\"";
                                    es=JSON.parse(es);
                                    arg+=es;cur++;
                                }else{
                                    return make_error("Expected escape sequence, but found EOF");
                                }
                            }else if(ss[cur]=="\""){
                                if(cur+1<len&&ss[cur+1]=="]"){cur+=2;break;}
                                else return make_error("Expected ]");
                            }else arg+=ss[cur];
                        }else{
                            if(ss[cur]=="]"){cur++;break;}
                            if(ss[cur]=="="){
                                argon=true;
                                if(cur+1<len&&ss[cur+1]=="\"")cur++;
                                else return make_error("Expected quote after =");
                            }
                            else tag+=ss[cur];
                        }
                        cur++;
                    }
                    if(tag.length==0)return make_error("Empty tag(It's an internal problem.)");
                    if(tag[0]=='/'){
                        tag=tag.substr(1,tag.length-1);
                        if(tag==sta[sta.length-1]){
                            if(!collapse())return arr_proc(sta2[0]);
                        }else return make_error("Mismatched close tag: expected "+sta[sta.length-1]+" found "+tag);
                    }else{
                        if(raws[tag]==1)raw_mode=true;else raw_mode=false;
                        sta.push(tag);
                        sta2.push([]);
                        sta2[sta.length-1].push(tag);
                        if(argon){
                            sta2[sta.length-1].push(arg);
                        }else sta2[sta.length-1].push(undefined);
                        if(raws[tag]==-1)if(!collapse())return arr_proc(sta2[0]);
                    }
                }
            }
        }else if(ss[cur]=="@"){
            cur++;
            let mt="";
            while(cur<len&&ss[cur]!="\n"&&ss[cur]!="\r"){
                mt+=ss[cur];cur++;
            }
            meta=JSON.parse(mt.trim());
            if(filename!="")meta.filename=filename;
            if(date!=undefined&&date!="")meta.date=date;
        }else if(ss[cur]=="$"){
            if(raw_mode){
                if(sta[sta.length-1]=="$"){
                    if(!collapse())return arr_proc(sta2[0]);
                    raw_mode=0;
                }else{sta2[sta.length-1].push(ss[cur]);}
            }else{
                sta.push("$");
                sta2.push([]);
                sta2[sta.length-1].push("$");
                sta2[sta.length-1].push(undefined);
                raw_mode=true;
            }
            cur++;
        }else{
            sta2[sta.length-1].push(ss[cur]);cur++;
        }
    }
    if(sta.din!=1)make_error("Expected more close tabs, but found EOF");
    return arr_proc(sta2[0]);
}
//fun: function(com_name,inner_html,inner_raw,arg)
function register_tag(nam,fun,spec){
	if(spec!=0&&spec!=undefined)raws[nam]=spec;
	tagfun[nam]=fun;
}

for(let i=1;i<=6;i++){
	register_tag("h"+i,function(com_name,inner_html,inner_raw,arg){
            bookmarx.push([JSON.parse(com_name[1]),inner_html]);
            return"<a name=\"bm"+bookmarx.length+"\"></a><"+com_name+">"+inner_html+"</"+com_name+">";
	});
}
function make_index(){
let index_page="@{\"title\":\"Home\"}\n[img]../res/juruo.svg[/img]\n";
pages.sort(function(a,b){return b.date-a.date;});
for(let i=0;i<pages.length;i++)index_page+="[urlbox=\""+pages[i].filename+"\"]"+pages[i].title+"[/urlbox]";
return index_page;
}
module.exports={
	proc:proc,
	register_tag:register_tag,
	make_index:make_index,
	raw_tag:raw_tag,
	nopair_tag:nopair_tag}
