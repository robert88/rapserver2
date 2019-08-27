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
  run.pipe.tapAsync({
    name: "cache",
    fn(request, response, next) {
      var obj = {
        cookies(set) {
          var cookies = set.headers["cookie"];
          return cookies && qs.parse(cookies.replace(";", "&")) || {}
        },
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
  run.pipe.tapAsync({
    name: "cacheResponse",
    after: ["staticFile","ResponseFinish"],
    fn(request, response, next) {
      let realStat = request.rap.realStat;
      if (realStat) {
        let cache = request.rap.cache;
        
        response.setHeader("Last-Modified", realStat["Last-Modified"])
        response.setHeader("ETag", realStat["ETag"])

        if (cache.etag) {
          if (cache.etag == realStat["ETag"]) {
            response.writeHead(304);
            response.end();
            return;
          }
        } else if (cache.modify) {
          if (cache.modify == realStat["Last-Modified"]) {
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