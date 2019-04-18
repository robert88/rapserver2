//重新定义require
const nodeRequire = module.constructor.prototype.require;

const getPaths = require("./node_modules/enhanced-resolve/lib/getPaths.js");

const {paths} = getPaths(process.cwd());

const pt = require("path");

const fs = require("fs");

const CachedInputFileSystem = require("./node_modules/enhanced-resolve/lib/CachedInputFileSystem.js");

const inputWake = CachedInputFileSystem({existsSync:fs.existsSync},1000);
//将package.json表示跟目录，如果没有使用当前执行环境路径
const rootPath = process.cwd();

paths.forEach(dir=>{
    var packagePath = pt.resolve(dir,"package.json");
    if(CachedInputFileSystem.existsSync(packagePath)){
        rootPath = dir;
        return 
    }
})


//unload不需要加载模块，只需要转换后的url
global.localRequire = function(url,unLoad){
    if(/^@\//.test(url)){

    }
    //得到路径
    if(unLoad){
        return url;
    }else{
        return nodeRequire.call(this,file);
    }
}
