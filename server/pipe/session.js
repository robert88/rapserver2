/*cookie和session*/
const output = rap.system.output;
const input = rap.system.input;
var timer;

//回收session
function gcSession(sessionRootPath) {
  clearTimeout(timer)
  // 必须删除掉之前的session
  console.log("删除过期session...");
  let currentTime = new Date().getTime();
  var allFile = input.findFileSync(sessionRootPath, "json", true);
  allFile.forEach(file => {
    let stat = input.statSync(file);
    let ct = Math.floor(stat.birthtimeMs);
    if (currentTime > (ct + 30 * 24 * 60 * 60 * 1000)) { //超过30天就过期
      output.removeSync(file);
    }
  });
  console.log("成功删除过期session");

  timer = setTimeout(function() {
    gcSession(sessionRootPath);
  }, 15 * 24 * 60 * 60 * 1000); //超过15天检查一次

}

module.exports = function(run) {

  var sessionRootPath = localRequire("@/server/templ/session", true);

  gcSession(sessionRootPath);

  //request
  run.inPipe.tapAsync({
    name: "session",
    fn(request, response, next) {
      let sessionId = response.rap.cookie["RAPID"] || response.rap.cookie["RAPID"].value;
      let sessionIdSplit = sessionId.split("_");
      let sessionPath = sessionIdSplit.slice(0, sessionIdSplit.length - 1).join("/");
      let sessionFile = sessionIdSplit.slice(sessionIdSplit.length - 1, sessionIdSplit.length) + ".json";
      let absPath = sessionRootPath + "/" + sessionPath + "/" + sessionFile;

      response.rap.session = {

        reset(callback) {
          this.cache = {};
          this.setSessionFileData(callback);
        },
        del(key, callback) {
          this.set(key, null, callback);
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