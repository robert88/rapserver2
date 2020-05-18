require("../../lib/common.js");
var resolve = require("../resolve");
const wake = rap.system.input;
const wakeout = rap.system.output;
var dir = localRequire("@/server/static/doc",true).toURI();
var template = localRequire("@/server/static/doc/index.html",true).toURI();
var mdfiles = wake.findFileSync(dir,"md",true);
var pt = require("path");
var nav = {};
rap.parse = rap.parse||{}
rap.parse.outputName = rap.parse.outputName||"cn"
mdfiles.forEach(item => {
    var url = item.toURI().replace(dir,"").toURI();
    var basename = pt.basename(url);
    var extname = pt.extname(url);
    var urlitem = url.split("/");
    var str = [];
    urlitem.forEach(t=>{
        if(t){
           str.push(t);
        }
    })
    if(str.length>1){
        nav[str[0]] = nav[str[0]]|| {
            name:str[0],
            child:{}
        }
        nav[str[0]].child[basename] = {
            name:basename.replace(extname,""),
            path:resolve.browser("./"+url).toURI(),
        }
    }else if(str.length==1){
        nav[str[0]] = {
            name:basename.replace(extname,""),
            path:resolve.browser("./"+url).toURI(),
        }
    }else{
        return;
    }

    if(url){
       var outfile =  resolve.output(template,"./"+url).toURI();
       wakeout.copySync(item,outfile);
    }
});

module.exports = {
    nav:nav
}