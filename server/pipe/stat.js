const StaticFileState = localRequire("@/server/pipe/stat.file.js");

/*处理缓存，服务器端缓存和客户端缓存
 * staticMap 静态资源map
 * 
 * 
 */

module.exports = function(run) {

  run.state = new StaticFileState(run.config.staticMap, rap.system, localRequire("@/server/templ/cache", true));

  //update作为整体更新
  run.update.tapAsync({
    name: "stat",
    fn(request, response, next) {
      run.state.init(err => {
        if (err) {
          throw err;
        }
        next();
      });
    }
  })

  //request
  run.inPipe.tapAsync({
    name: "stat",
    fn(request, response, next) {

      let realFile = request.rap.realFile;
      let realId = request.rap.realId;
      let realRoot = request.rap.realRoot;
      if (realFile) {
        //可以读取和更新
        run.state.readOrUpdate(realId, realRoot, realFile, "read", (err, data) => {
          if (err) {
            throw err;
          }
          request.rap.realStat = data; //得到当前url的stat信息
          next();
        });

      } else {
        next();
      }
    }
  })

  //response
  run.outPipe.tapAsync({
    name: "stat",
    fn(request, response, next) {
      //依赖于staticFile
      let realStat = request.rap.realStat;
      if (realStat && !response.finished) {
        var cache = {
          modify: request.headers["if-modified-single"],
          etag: request.headers["if-none-match"]
        }
        response.setHeader("Last-Modified", realStat["Last-Modified"])
        response.setHeader("ETag", realStat["ETag"])

        if (cache.etag) {
          if (cache.etag == realStat["ETag"]) {
            response.removeHeader("Transfer-Encoding")
            response.removeHeader("Content-Length")
            response.writeHead(304);
            response.end();
            return;
          }
        } else if (cache.modify) {
          if (cache.modify == realStat["Last-Modified"]) {
            response.removeHeader("Transfer-Encoding")
            response.removeHeader("Content-Length")
            response.writeHead(304);
            response.end();
            return;
          }
        }
      }

      next();

    }
  })
}