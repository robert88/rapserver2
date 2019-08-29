/**
 *如果存在就返回一个真实的地址
 * */
function checkFileExist(ret, rootPath, callback) {
  let absolutePathTemp = (rootPath + "/" + ret).toURI();
  //地址是ip地址
  if (rootPath.indexOf("\\\\") == 0) {
    absolutePathTemp = absolutePathTemp.replace(/^\\|^\//, "\\\\");
  }
  rap.system.input.exists(absolutePathTemp, function(err, ret) {
    if (!err && ret) {
      callback(absolutePathTemp);
    } else {
      callback();
    }
  })
}


/*处理静态资源*/

module.exports = function(run, staticMap) {

  //request
  run.inPipe.tapAsync({
    name: "staticFileSetId",
    fn(request, response, next) {

      request.rap = request.rap || {};

      //如果不是action，那么是realFile,下面是检索realFile
      if (request.rap.action || request.rap.realFile) {
        next();
        return;
      }
      //获取特殊根地址
      let cookiesRootId = request.rap.cookies && request.rap.cookies["serverRootId"];
      let queryRootId = request.rap.query && request.rap.query["serverRootId"];
      //query优先
      responseRootId = queryRootId || cookiesRootId;
      if (responseRootId && staticMap[responseRootId]) {
        checkFileExist(request.rap.url, staticMap[responseRootId], realFile => {
          if (realFile) {
            request.rap.realFile = realFile; //真实路径
            request.rap.realRoot = staticMap[responseRootId]; //真实的跟路径
            request.rap.realId = responseRootId; //真实的跟路径的id
            next();
          } else if (queue.length == 0) {
            throw new Error(`ENOENT: no such file or directory, stat '${request.rap.url}'`)
          }
        });
      } else {
        next();
      }
    }
  })


}