const AsyncSeries = localRequire("@/server/lib/node_modules/enhanced-resolve/lib/AsyncSeries.js")
const zlib = require("zlib");
const path = require("path");
const fs = require("fs");
const m1 = 1 * 1024 * 1024; //3mb大小
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

// 压缩
const zlibMap = {
  "gzip": zlib.createGzip
};
const zipType = zlibMap["gzip"];

/*处理静态资源*/
module.exports = function(run, staticMap) {

  //request
  run.inPipe.tapAsync({
    name: "staticFile",
    fn(request, response, next) {

      request.rap = request.rap || {};

      //如果不是action，那么是realFile,下面是检索realFile
      if (request.rap.action || request.rap.realFile) {
        next();
        return;
      }
      //获取特殊根地址

      var asyncArr = [];

      for (var id in staticMap) {
        asyncArr.push((queue) => {
          checkFileExist(request.url, staticMap[id], realFile => {
            if (realFile) {
              queue.done(null, realFile, id, staticMap[id]);
            } else if (queue.queue.length == 0) {
              queue.done(new Error(`ENOENT: no such file or directory, stat '${request.url}'`));
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
        next();
      })

    }
  })

  run.outPipe.tapAsync({
    name: "staticFile",
    fn(request, response, next) {
      var filePath = request.rap.realFile;
      //存在静态文件
      if (!filePath) {
        next();
        return;
      }
      //浏览器接收的压缩方式
      var acceptEncoding = request.headers["accept-encoding"] || "";

      var clientSupportGzip = acceptEncoding.match(new RegExp("gzip", "i"))
      //这些文件已经经过了高度压缩,所以不需要压缩
      var fileNotZip = /(jpg)|(ppt)|(doc)|(ico)|(gif)|(png)|(mp3)|(mp4)|(wav)/.test(path.extname(filePath));
      let zip;
      let realStat = request.rap.realStat;
      //文件是否需要压缩，且客户端是否支持压缩,只支持gzip压缩
      if (!fileNotZip && clientSupportGzip) {
        zip = zipType();
        response.setHeader("Content-Encoding", "gzip");
        
        //保持连接，设置错了报错HPE_INVALID_CONSTANT
        response.setHeader("Transfer-Encoding", "chunked");
        response.removeHeader("Content-Length")
      }else if(realStat&&realStat["size"]){
        //这两个是对立的如果设置Transfer-Encoding，那么就会报错，HPE_UNEXPECTED_CONTENT_LENGTH
        if(realStat["size"]<m1){
          response.setHeader("Content-Length", realStat["size"]);
          response.removeHeader("Transfer-Encoding")
        }else{
          response.setHeader("Transfer-Encoding", "chunked");
        }
      }



      response.writeHead(200);

      let inp = fs.createReadStream(filePath);
      if (zip) {
        inp.pipe(zip).pipe(response);
      } else {
        inp.pipe(response);
      }

    }
  })
}