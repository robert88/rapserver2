require("../../lib/global/global.localRequire");

localRequire("@/server/lib/global/global.js");

localRequire("@/server/lib/rap/rap.js");

localRequire("@/server/build/rapserver/compiler/rap.parse.js");

var pt = require("path");

var root = __dirname.toURI().replace("/server/test/compiler","")

var config={
    suffix:"cn",
    resolve:function(templatePath,resolvePath){
        if(resolvePath.trim().toURI().indexOf("/")==0){
            return root+resolvePath.trim().toURI();
        }else{
            return pt.resolve(pt.dirname(templatePath),resolvePath);
        }
    }
}

var parentData={__templateFile__:"test2.html"};

var parentRelativeWatch = {};

var unique = {};

var orgHTML = rap.parse.byHtmlFile(pt.resolve(__dirname,"./useTag.html"), config, parentData, parentRelativeWatch, unique)
console.log(orgHTML)