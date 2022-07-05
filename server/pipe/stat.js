const StaticFileState = localRequire("@/server/lib/StaticFileState.js");

const toPath = localRequire("@/server/lib/node_modules/enhanced-resolve/lib/toPath.js");


/*处理缓存，服务器端缓存和客户端缓存
 * staticMap 静态资源map
 * 
 * 
 */

module.exports = function(run) {

  console.log("统计stat信息...")
  run.stat = new StaticFileState();
  run.stat.init(run.config.staticList).catch(e => {
    rap.console.error(e)
  });

  //request
  run.inPipe.tapAsync({
    name: "stat",
    fn(request, response, next) {
      //已经匹配了action
      if(response.rap.action||response.rap.redirect){
        next();
        return;
      }
      for(let i=0;i<run.config.staticList.length;i++){
        var map = run.config.staticList[i];
        let stat =  run.stat.get(toPath(map.name+"/"+response.rap.url), null, true);
        if(stat){
          response.rap.realStat = stat;
          break;
        }
      }
      //还是没找到就去缓存里面找
      if(response.rap.realStat){
        next();
      }else if(run.stat.map.value[toPath(response.rap.url)]){//404
        next();
      }else{
        run.stat.getById(run.config.staticList,toPath(response.rap.url)).catch(e=>{//getByID的错误
          next();
        }).then(stat=>{
          response.rap.realStat = stat;//可能404，可能正确的文件信息
          next();
        }).catch(err=>{//next的错误捕获
          rap.console.error("error:", "[stat promise catch]", "response url:" + response.rap && response.rap.url, err.stack);
          run.error.callAsync(err, response, "promise", () => {});
        })
      }
      

    }
  })

  //response
  run.outPipe.tapAsync({
    name: "stat",
    fn(request, response, next) {

      //依赖于staticFile
      let realStat = response.rap.realStat&&response.rap.realStat.value;
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