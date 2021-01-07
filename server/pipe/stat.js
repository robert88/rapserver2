const StaticFileState = localRequire("@/server/lib/StaticFileState.js");


const { getDefaultFile } = localRequire("@/server/lib/resolveFile.js")

/*处理缓存，服务器端缓存和客户端缓存
 * staticMap 静态资源map
 * 
 * 
 */

module.exports = function(run) {

  console.log("统计stat信息...")
  run.stat = new StaticFileState();
  run.stat.init(run.config.staticList).catch(e => { rap.console.error(e) });

  //request
  run.inPipe.tapAsync({
    name: "stat",
    fn(request, response, next) {
      response.rap.realStat = run.stat.get(response.rap.url,null,true);
      next();
    }
  })

  //response
  run.outPipe.tapAsync({
    name: "stat",
    fn(request, response, next) {

      //依赖于staticFile
      let realStat = response.rap.realStat.value;
      if (realStat) {
        let modify = request.headers["if-modified-since"];
        let etag = request.headers["if-none-match"];
        response.setHeader("Last-Modified", realStat["Last-Modified"]);
        response.setHeader("ETag", realStat["ETag"]);
        if (etag == realStat["ETag"]) {
          response.removeHeader("Transfer-Encoding");
          response.removeHeader("Content-Length");
          response.writeHead(304);
          response.end();
        } else if (modify == realStat["Last-Modified"]) {
          response.removeHeader("Transfer-Encoding");
          response.removeHeader("Content-Length");
          response.writeHead(304);
          response.end();
        } else {
          next();
        }
      } else {
        throw new Error(`ENOENT: no such file or directory, stat '${response.rap.url}'`);
      }

    }
  })
}