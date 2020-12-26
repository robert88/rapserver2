const StaticFileState = localRequire("@/server/lib/stat.file.js");

/*处理缓存，服务器端缓存和客户端缓存
 * staticMap 静态资源map
 * 
 * 
 */

module.exports = function(run) {

  console.log("统计stat信息...")
  run.state = new StaticFileState(run.config.staticMap, rap.system, localRequire("@/server/templ/stat", true));
  rap.console.log("已统计stat信息", localRequire("@/server/templ/stat", true));

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

      let realFile = response.rap.realFile;
      let realId = response.rap.realId;
      let realRoot = response.rap.realRoot;
      if (realFile) {
        //可以读取和更新
        run.state.readOrUpdate(realId, realRoot, realFile, (err,data) => {
          if(err){
            throw err;
          }
          response.rap.realStat = data; //得到当前url的stat信息
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
      let realStat = response.rap.realStat;
      if (realStat && !response.finished) {
        var cache = {
          modify: request.headers["if-modified-since"],
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