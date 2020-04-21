
const fs = require("fs");

localRequire("@/server/lib/global/extention.String.js")

const domain = require('domain');
const wake = rap.system.input
/**
 *
 * 添加监听文件
 */
// persistent 指示只要正在监视文件，进程是否应继续运行。recursive指示是应该监视所有子目录，还是仅监视当前目录。

var timer;
var changeMsg = new Set();
var watchCallback = {};
var watchCache = {};

rap.watch = function(orgDir,callback){

    orgDir = orgDir.toURI();
    //监听文件夹，可以多次监听
     if(wake.existsSync(orgDir) && wake.isDirSync(orgDir)){
        watchCallback[orgDir] = watchCallback[orgDir]||[];
        watchCallback[orgDir].push(callback);
         bindWatch(orgDir);
     }
    addWatchLock =false;
}

//监听文件夹
function bindWatch(dir){
    let d = domain.create();
    d.run(()=>{
        //只需要监听一次,包括父类
        if(Object.keys(watchCache).indexOf(dir)!=-1 ){
          return;
        }
        //recursive表示深度监听
        watchCache[dir] =  fs.watch(dir,{recursive:true},function(type,file){
            handleChange(dir,(dir+"/"+file).toURI());
        });
    })
    //捕获异步异常,删除监听文件会抛出异常
    d.on('error', function (err) {
       console.log(err);
    });
}

//处理这个change
function handleChange(orgDir,fullFile){
    
    changeMsg.add(fullFile);

    //每隔1s执行一下回调,统一将发生改变的信息发给callback处理
    clearTimeout(timer)
    timer = setTimeout(function () {
        watchCallback[orgDir].forEach((callback)=>{
            if(typeof callback=="function"){
                callback(changeMsg);
            }
        })
      
        changeMsg.clear();
    },1000);
}
