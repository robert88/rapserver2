### rapserver @ 和 localRequire的使用   global.localRequire.js

node中加载模块使用的是require，但是在rap系统中采用了@来替换根路径

为了区分require这个api提供了localRequire来使用@

并且提供两个功能,如下

``` javascript

//得到完整路径
localRequire("@/server/static", true) 

//加载模块
localRequire("@/server/static") 

```

./lib/global/global.localRequire.js

``` javascript
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

```