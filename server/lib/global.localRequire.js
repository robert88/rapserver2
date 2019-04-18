
//重新定义require
const nodeRequire = module.constructor.prototype.require;

const getPaths = require("enhanced-resolve/lib/getPaths");

const {paths} = getPaths(process.cwd());

const pt = require("path");

const fs = require("fs");

const inputWake = require("./inputFileSystem.js");

//将package.json表示跟目录，如果没有使用当前执行环境路径
const rootPath = process.cwd();

//获得根目录
paths.forEach(dir=>{
    var packagePath = pt.resolve(dir,"package.json");
    if(inputWake.existsSync(packagePath)){
        rootPath = dir;
        return false;
    }
})


//unload不需要加载模块，只需要转换后的url
global.localRequire = function(url,unLoad){

    if(/^@\//.test(url)){
        url = url.replace(/^@/,rootPath);
    }
    //得到路径
    if(unLoad){
        return url;
    }else{
        return nodeRequire.call(this,file);
    }
}
