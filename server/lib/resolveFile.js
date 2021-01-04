const AsyncSeries = localRequire("@/server/lib/node_modules/enhanced-resolve/lib/AsyncSeries.js")

const pt = require("path");


//如果没有定义文件类型默认是html
function getDefaultFile(path) {

  var basename = pt.basename(path);

  if (!basename) {
    path = "index.html";
  }

  var extname = pt.extname(path);

  //如果没有配置查看目录那么就
  if (!extname) {
    path = path + ".html"; //尝试匹配html
  }

  path = path.toURI();

  return path;

}

/**
 *如果存在就返回一个真实的地址
 * */
function checkFileExist(run, path, rootPath, callback) {


  if(!run.config.directoryView){
    path =  getDefaultFile(path)
  }


  let absolutePathTemp = (rootPath + "/" + path).toURI();

  //地址是ip地址
  if (rootPath.indexOf("\\\\") == 0) {
    absolutePathTemp = absolutePathTemp.replace(/^\\|^\//, "\\\\");
  }
  rap.system.input.exists(absolutePathTemp, function(err, flag) {
    if (!err && flag) {
      callback(absolutePathTemp);
    } else { //不存在
      callback();
    }
  })
}




module.exports={
  resolve(run,staticMap,url,callback){
     //获取特殊根地址

     var asyncArr = [];
    for (let id in staticMap) {
      //必须传递function不能用箭头函数
      asyncArr.push(function() {
        var queue = this;
        checkFileExist(run, url, staticMap[id], realFile => {
          if (realFile) {
            queue.done(null, realFile, id, staticMap[id]);
          } else {
            queue.next();
          }
        });
      })
    }
    
    //异步处理
    new AsyncSeries(asyncArr, callback)
  },
  getDefaultFile:getDefaultFile
}