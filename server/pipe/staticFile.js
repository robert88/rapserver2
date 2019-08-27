const mine = localRequire("@/server/pipe/staticFile.extname.js");
const AsyncSeries = localRequire("@/server/lib/node_modules/enhanced-resolve/lib/AsyncSeries.js")
/**
 *如果存在就返回一个真实的地址
 * */
function checkFileExist(ret, rootPath, callback) {
  let absolutePathTemp = (rootPath + "/" + ret).toURI();
  //地址是ip地址
  if (rootPath.indexOf("\\\\") == 0) {
    absolutePathTemp = absolutePathTemp.replace(/^\\|^\//, "\\\\");
  }
  rap.system.input.isExist(absolutePathTemp, function(ret) {
    if (ret) {
      callback(absolutePathTemp);
    } else {
      callback();
    }
  })
}

// 压缩
const zlibMap = {
  "gzip": zlib.createGzip,
  "gunzip": zlib.createGunzip,
  "deflate": zlib.createInflate
};
const zipType = zlibMap["gzip"];

/*处理静态资源*/

module.exports = function(run, staticMap) {

  //request
  run.pipe.tapAsync({
    name: "staticFile",
    after: "action",
    fn(request, response, next) {



      request.rap = request.rap || {};

      //浏览器接收的压缩方式
      var acceptEncoding = request.headers["accept-encoding"] || "";

      if (acceptEncoding.match(new RegExp("gzip", "i"))) {
        request.rap.contentEncoding = "gzip"
      }

      //如果不是action，那么是realFile
      if (!request.rap.action) {

        //获取特殊根地址
        let responseRootId = request.rap.query.responseRootId;
        let findMap = staticMap;
        if (responseRootId && staticMap[responseRootId]) {
          findMap = { responseRootId: staticMap[responseRootId] }
        }
        var asyncArr = [];

        for (var id in findMap) {
          asyncArr.push((queue) => {
            checkFileExist(request.rap.url, findMap[id], realFile => {
              if (realFile) {
                queue.done(null, realFile, id, findMap[id]);
              } else if (queue.length == 0) {
                queue.done(new Error(`ENOENT: no such file or directory, stat '${request.rap.url}'`));
              }
            });
          })
        }

        //异步处理
        new AsyncSeries(asyncArr, (err, realFile, realId, realRoot) => {
          if (err) {
            throw err;
          }
          request.rap.realFile = realFile; //真实路径
          request.rap.realRoot = realRoot; //真实的跟路径
          request.rap.realId = realId; //真实的跟路径的id
        })
      }
    }
  })

  run.pipe.tapAsync({
    name: "staticFile",
    before: "ResponseFinish",
    fn(request, response, next) {
      //分块传输
      response.setHeaders("Transfer-Encoding", "chunked");
      response.setHeaders("Connection", "keep-alive");
      let zip;
      //这些文件已经经过了高度压缩,所以不需要压缩
      if (!/(jpg)|(ppt)|(doc)|(ico)|(gif)|(png)|(mp3)|(mp4)|(wav)/.test(path.extname(filePath))) {
        zip = zipType();
        response.setHeaders("Content-Encoding", request.rap.contentEncoding);
      }

      //设置
      if (!(request.rap.contentEncoding && zip) && fileStatInfo["size"]) {

        headerOption["Content-Length"] = fileStatInfo["size"];

      }
      next()
    }
  })
}