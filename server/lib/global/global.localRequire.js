

const getPaths = require("../node_modules/enhanced-resolve/lib/getPaths.js");
const toPath = require("../node_modules/enhanced-resolve/lib/toPath.js");

const {paths} = getPaths(process.cwd());

const pt = require("path");
const fs = require("fs");




//将package.json表示跟目录，如果没有使用当前执行环境路径
let rootPath = process.cwd();

paths.forEach(dir=>{
    var packagePath = pt.resolve(dir,"package.json");
    if(fs.existsSync(packagePath)){
        rootPath = dir;
        return 
    }
})

console.log("根目录："+rootPath)

//unload不需要加载模块，只需要转换后的url
global.localRequire = function(url,unLoad){
    if(/^@\//.test(url)){
        url = toPath(url.replace(/^@\//,rootPath+"/"));
    }
    //得到路径
    if(unLoad){
        return url;
    }else{
        return require(url);
    }
}

