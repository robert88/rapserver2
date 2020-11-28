/*cookie和session*/

module.exports = function(run, staticMap) {

  var sessionRootPath = localRequire("@/server/templ/session", true);

  //request
  run.inPipe.tapAsync({
    name: "session",
    fn(request, response, next) {
      let sessionId = request.rap.cookie["RAPID"] || response.rap.cookie["RAPID"].value;
      let sessionIdSplit = sessionId.split("_");
      let sessionPath = sessionIdSplit.slice(0, sessionIdSplit.length - 1).join("/");
      let sessionFile = sessionIdSplit.slice(sessionIdSplit.length - 1, sessionIdSplit.length) + ".json";
      let absPath = sessionRootPath + "/" + sessionPath + "/" + sessionFile;

      request.rap.session = {

        reset(callback) {
          this.cache = {};
          this.setSessionFileData(callback);
        },
        del(key, callback) {
          this.set(key, null, callback)
        },
        set(key, value, callback) {
          //session必须再cookie之后
          var oldVal = this.get(key);

          if (oldVal != value) {
            this.cache[key] = value;
            this.setSessionFileData(callback);
          } else {
            callback(this.cache)
          }
        },
        //session存储在磁盘上
        setSessionFileData(callback) {
          rap.system.output.write(absPath, JSON.stringify(this.cache)).then(() => {
            rap.system.input.purge("all", file);
            callback(this.cache);
          }).catch(e => {
            throw e;
          })
        },
        getSessionFileData() {
          try {
            this.cache = rap.system.input.readJsonSync(absPath);
          } catch (e) {
            this.cache = {};
          }
        },
        get(key) {

          if (!this.cache) {
            this.getSessionFileData();
          }
          return this.cache[key];

        }
      }
      next();
    }
  })

}