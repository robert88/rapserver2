const AsyncSeries = localRequire("@/server/lib/node_modules/enhanced-resolve/lib/AsyncSeries.js");
const mineType = localRequire("@/server/lib/staticFile.extname.js");
const { resolve } = localRequire("@/server/lib/resolveFile.js");
const toPath = localRequire("@/server/lib/node_modules/enhanced-resolve/lib/toPath.js");

const zlib = require("zlib");
const path = require("path");
const fs = require("fs");
const k100 = 1 * 100 * 1024; //1mb大小
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


// 压缩
const zlibMap = {
  "gzip": zlib.createGzip
};
const zipType = zlibMap["gzip"];

/*处理静态资源*/
module.exports = function(run) {

  run.outPipe.tapAsync({
    name: "staticFile",
    fn(request, response, next) {

      //浏览器接收的压缩方式
      let acceptEncoding = request.headers["accept-encoding"] || "";
      let clientSupportGzip = acceptEncoding.match(new RegExp("gzip", "i"));

      //这些文件已经经过了高度压缩,所以不需要压缩
      let realStat = response.rap.realStat.value;
      let extname = path.extname(realStat.path).replace(".", "");
      let videoFile = /(mp3)|(mp4)|(wav)/.test(extname);
      let fileNotZip = /(jpg)|(ppt)|(pdf)|(doc)|(ico)|(gif)|(png)|(mp3)|(mp4)|(wav)/.test(extname);

      //文件类型
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
        response.setHeader("Content-Type", ["text/html"]);
        let ret = ""
        if (response.rap.url != "/") {
          ret += ' <a href = "{0}" > {0}</a> \n'.tpl(path.dirname(response.rap.url))
        }
        var child = response.rap.realStat.child || {};

        for (var name in child) {
          ret += ' <a href = "{0}" > {1}</a> \n'.tpl(toPath(response.rap.url + "/" + name), name);
        }
        response.writeHead(200);
        response.end(html5.tpl(ret));
      } else if (videoFile) {
        headerOption["Content-Length"] = realStat.size;
        headerOption["Content-Range"] = "bytes 0-{0}/{1}".tpl(realStat.size - 1, realStat.size);
        response.writeHead(206);
        fs.createReadStream(realStat.path).pipe(response);
        //文件是否需要压缩，且客户端是否支持压缩,只支持gzip压缩
      } else if (!fileNotZip && clientSupportGzip) {
        let zip = zipType();
        response.setHeader("Content-Encoding", "gzip");
        //保持连接，设置错了报错HPE_INVALID_CONSTANT
        response.setHeader("Transfer-Encoding", "chunked");
        response.removeHeader("Content-Length")
        response.writeHead(200);
        fs.createReadStream(realStat.path).pipe(zip).pipe(response);
      } else {
        //这两个是对立的如果设置Transfer-Encoding，那么就会报错，HPE_UNEXPECTED_CONTENT_LENGTH
        if (realStat["size"] < k100) {
          response.setHeader("Content-Length", realStat["size"]);
          response.removeHeader("Transfer-Encoding")
        } else {
          response.setHeader("Transfer-Encoding", "chunked");
          response.removeHeader("Content-Length");
        }
        response.writeHead(200);
        fs.createReadStream(realStat.path).pipe(response);
      }
    }
  })
}