/*cookie和session*/

module.exports = function(run, staticMap) {

  var sessionRootPath = localRequire("@/server/templ/session", true);

  //request
  run.inPipe.tapAsync({
    name: "session",
    fn(request, response, next) {
      request.rap.session = {
        reset(callback) {
          this.cache = {};
          this.set(null,null,callback);
        },
        del(key,callback) {
          this.set(key,null,callback)
        },
        set(key, value,callback) {
          //session必须再cookie之后
          let sessionId = request.rap.cookie["RAPID"];
          if (!sessionId) {
            sessionId = response.rap.cookie["RAPID"].value;
          }
          if(this.cache){
            if(key){
              this.cache[key]=value;
            }
            let file = this.getSessionFile(sessionId)
            rap.system.output.write(file,JSON.stringify(this.cache)).then(()=>{
              rap.system.input.purge("all",file);
              callback(this.cache);
            }).catch(e=>{
              throw e;
            })
          }else{
            this.getSessionFileData(sessionId);
            if(this.cache&&this.cache[key]!=value){
              this.set(key, value,callback)
            }else{
              callback(this.cache)
            }
          }
         
        },
        //session存储在磁盘上
        getSessionFile(sessionId){
          let sessionIdSplit = sessionId.split("_");
          let sessionPath = sessionIdSplit.slice(0, sessionIdSplit.length - 1).join("/");
          let sessionFile = sessionIdSplit.slice(sessionIdSplit.length - 1, sessionIdSplit.length) + ".json";
          let absPath = sessionRootPath + "/" + sessionPath + "/" + sessionFile;
          return absPath;
        },
        getSessionFileData(sessionId){
          let absPath =  this.getSessionFile(sessionId);
          try{
            this.cache = rap.system.input.readJsonSync(absPath);
          }catch(e){
            this.cache = {};
          }
          return this.cache[sessionId];
        },
        get(key) {
          let sessionId = request.rap.cookie["RAPID"];
          if (sessionId) {
            if (!this.cache) {
              this.getSessionFileData(sessionId);
            }
            return this.cache[key];
          }else{
            return null
          }
        }
      }
      next();
    }
  })

}