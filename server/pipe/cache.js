const StaticFileState = localRequire("@/server/pipe/cache.file.js");

/*处理缓存，服务器端缓存和客户端缓存*/

module.exports = function(run, staticMap) {

  let state = new StaticFileState(staticMap, rap.system, localRequire("@/server/templ/cache", true));

  
  //更新这个文件的cache
  run.update.tapAsync({
    name: "cache",
    fn(file, next) {
      let realId,readRoot;
      for(let id in staticMap){
        if(~file.indexOf(staticMap[id])){
          realId = id;
          readRoot = staticMap[id];
          break;
        }
      }
      state.readOrUpdate(realId,readRoot, file,"update", (err,data) => {
        next();
      })
    }
  })

  //request
  run.inPipe.tapAsync({
    name: "cache",
    fn(request, response, next) {
      var obj = {
        modify(set) {
          var modify = set.headers["if-modified-single"];
          return modify;
        },
        etag(set) {
          var etag = set.headers["if-none-match"];
          return etag
        }
      }

      //得到属性
      for (var i in obj) {
        obj[i] = obj[i](request);
      }

      request.rap = request.rap || {};

      request.rap.cache = obj;

      let realFile = request.rap.realFile;
      let realId = request.rap.realId;
      let realRoot = request.rap.realRoot;
      if(realFile){
        state.readOrUpdate(realId,realRoot,realFile,"read",(err,data)=>{
          if(!err){
            request.rap.realStat=data;//得到当前url的stat信息
          }
          next();
        });

      }else{
        next();
      }
    }
  })

  //response
  run.outPipe.tapAsync({
    name: "cache",
    fn(request, response, next) {
      //依赖于staticFile
      let realStat = request.rap.realStat;
      if (realStat) {
        let cache = request.rap.cache;
        
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

        next();
      } else {
        next();
      }

    }
  })
}