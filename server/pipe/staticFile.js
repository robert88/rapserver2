const AsyncSeries = localRequire("@/server/lib/node_modules/enhanced-resolve/lib/AsyncSeries.js")
const mineType = localRequire("@/server/pipe/staticFile.extname.js")

const zlib = require("zlib");
const path = require("path");
const fs = require("fs");
const m1 = 1 * 1024 * 1024; //1mb大小
let html5 = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>view Diretory</title>
</head>
<body>
<pre> 
{0}
</pre>
</body>
</html>`;
/**
 *如果存在就返回一个真实的地址
 * */
function checkFileExist(run, ret, rootPath, callback) {

  var basename = path.basename(ret);
  //如果是/ 默认就定义到index.html
  if (!basename && !run.config.directoryView) {
    ret = "index.html";
  }

  var extname = path.extname(ret);
  //如果没有配置查看目录那么就
  if (!extname && !run.config.directoryView) {
    ret = ret + ".html"; //尝试匹配html
  }


  let absolutePathTemp = (rootPath + "/" + ret).toURI();

  //地址是ip地址
  if (rootPath.indexOf("\\\\") == 0) {
    absolutePathTemp = absolutePathTemp.replace(/^\\|^\//, "\\\\");
  }
  rap.system.input.exists(absolutePathTemp, function(err, flag) {
    if (!err && flag) {
      callback(absolutePathTemp);
    } else { //不存在
      console.log("try find " + absolutePathTemp + " but not find");
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
module.exports = function(run) {
  if (!run.config.staticMap) {
    console.log("静态资源没有设置");
  }
  //request
  run.inPipe.tapAsync({
    name: "staticFile",
    fn(request, response, next) {

      //如果不是action，那么是realFile,下面是检索realFile
      if (request.rap.action || request.rap.realFile || !run.config.staticMap) {
        next();
        return;
      }
      //获取特殊根地址

      var asyncArr = [];

      //获取特殊根地址，query优先
      let cookiesRootId = request.rap.cookie && request.rap.cookie["serverRootId"];
      let queryRootId = request.rap.query && request.rap.query["serverRootId"];
      let responseRootId = queryRootId || cookiesRootId;
      let staticMap = {};

      if (run.config.staticMap[responseRootId]) {
        staticMap[responseRootId] = run.config.staticMap[responseRootId];
      } else {
        staticMap = run.config.staticMap;
      }

      for (var id in staticMap) {
        //必须传递function不能用箭头函数
        asyncArr.push(function() {
          var queue = this;
          checkFileExist(run, request.rap.url, staticMap[id], realFile => {
            if (realFile) {
              queue.done(null, realFile, id, staticMap[id]);
            } else {
              queue.next();
            }
          });
        })
      }

      //异步处理
      new AsyncSeries(asyncArr, (err, realFile, realId, realRoot) => {
        if (err) {
          throw err;
        }
        if (!realFile) {
          throw new Error(`ENOENT: no such file or directory, stat '${request.rap.url}'`);
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
      var realId = request.rap.realId;
      var realRoot = request.rap.realRoot;
      //存在静态文件
      if (!filePath || response.finished) {
        next();
        return;
      }
      //浏览器接收的压缩方式
      var acceptEncoding = request.headers["accept-encoding"] || "";

      var clientSupportGzip = acceptEncoding.match(new RegExp("gzip", "i"))
      //这些文件已经经过了高度压缩,所以不需要压缩
      let extname = path.extname(filePath);
      let videoFile = /(mp3)|(mp4)|(wav)/.test(extname);
      var fileNotZip = /(jpg)|(ppt)|(pdf)|(doc)|(ico)|(gif)|(png)/.test(extname);
      let zip;
      let realStat = request.rap.realStat;

      response.writeHead(200);
      if (mineType[extname]) {
        response.setHeader("Content-Type", [mineType[extname]]);
      }
      //开发环境都不开启缓存
      if (realStat["Cache-Control"]) {
        response.setHeader("Cache-Control", realStat["Cache-Control"]);
      }
      //允许脚本或者http响应头部信息
      if (realStat["Access-Control-Expose-Headers"]) {
        response.setHeader("Access-Control-Expose-Headers", realStat["Access-Control-Expose-Headers"])
      }

      //解析目录
      if (realStat["isDiretory"] && run.config.directoryView) {
        response.setHeader("Content-Type", ["text/html"])

        this.system.input.findFile(filePath, null, true, null, (err, files) => {
          if (err) {
            throw Error("system input io error")
          }
          let ret = ""
          if (request.rap.url != "/") {
            ret += ' <a href = "{0}" > {0}</a> \n'.tpl(path.dirname(f))
          }
          files.forEach(f => {
            ret += ' <a href = "{0}" > {1}</a> \n'.tpl(f.replace(realRoot, ""), path.basename(f));
          });

          response.writeHead(200);
          response.end(html5.tpl(ret));
        })


        return;
      }
      //文件是否需要压缩，且客户端是否支持压缩,只支持gzip压缩
      if (!videoFile && !fileNotZip && clientSupportGzip) {
        zip = zipType();
        response.setHeader("Content-Encoding", "gzip");

        //保持连接，设置错了报错HPE_INVALID_CONSTANT
        response.setHeader("Transfer-Encoding", "chunked");
        response.removeHeader("Content-Length")
      } else if (videoFile) {
        headerOption["Content-Length"] = realStat.size;
        headerOption["Content-Range"] = "bytes 0-{0}/{1}".tpl(realStat.size - 1, realStat.size);
        response.writeHead(206);
      } else if (realStat["size"]) {
        //这两个是对立的如果设置Transfer-Encoding，那么就会报错，HPE_UNEXPECTED_CONTENT_LENGTH
        if (realStat["size"] < m1) {
          response.setHeader("Content-Length", realStat["size"]);
          response.removeHeader("Transfer-Encoding")
        } else {
          response.setHeader("Transfer-Encoding", "chunked");
          response.removeHeader("Content-Length");
        }
      } else {
        throw new Error(`ENOENT: no such file or directory, stat '${request.rap.url}'`)
      }



      let inp = fs.createReadStream(filePath);
      if (zip) {
        inp.pipe(zip).pipe(response);
      } else {
        inp.pipe(response);
      }

      console.log("response static file ");
    }
  })
}