const pt = require("path");
const AsyncSeries = localRequire("@/server/lib/node_modules/enhanced-resolve/lib/AsyncSeries.js")

/*
 *将文件信息统计到一个json文件中
 */
class StaticFileState {
  constructor(staticStateMap, system, tempDir, log) {

    this.system = system;
    this.tempDir = tempDir;
    this.log = log || { warn: function() {} }
    if (!staticStateMap) {
      this.log.warn("warning not find static file path");
      return;
    }
    this.init(staticStateMap).catch(e => { console.error(e && e.message, e && e.stack) });
  }
  //多是异步的
  async init(staticStateMap) {
    this.stateMap = {};
    for (let id in staticStateMap) {
      await this.initOne(id, staticStateMap[id]);
    }
  }

  async initOne(id, root) {
    return await new Promise((resove, reject) => {
      // 参数：path, fileType, deep, filterFn, callback
      this.system.input.findAll(root, null, true, null, (err, allFile) => {
        if (err) {
          reject(err);
        }
        this.getAllStat(id, root, allFile).then((stateMap) => {
          resove(stateMap);
        }).catch(e => {
          reject(e);
        })
      })
    })
  }
  async getAllStat(id, root, allFile) {
    let stateMap = this.stateMap || {};
    for (var i = 0; i < allFile.length; i++) {
      let file = allFile[i];
      this.setMap(file, id, root, await this.getStat(file))
    }
    return stateMap
  }



  /*获取单个文件的stat信息*/
  async getStat(file) {
    let stat = {};
    let statInfo = await new Promise((resove, reject) => {
      this.system.input.stat(file, (err, stat) => {
        if (err) {
          reject(err);
          return;
        }
        resove(stat);
      });
    })

    stat["Last-Modified"] = statInfo.mtimeMs;
    stat["ETag"] = stat["Last-Modified"] + "-" + statInfo.size;
    stat["size"] = statInfo.size;
    stat["isDirectory"] = statInfo.isDirectory();
    var extName = pt.extname(file);
    if (extName == ".html") {
      stat["Cache-Control"] = "no-cache";
    } else {
      //开发环境不需要缓存
      if (ENV == "product") {
        stat["Cache-Control"] = "only-if-cached";
      }
    }
    //允许js可以获取头部
    if (extName == ".js") {
      stat["Access-Control-Expose-Headers"] = "X-Client-Ip";
    }
    return stat;
  }


  /*更新单个文件的stat信息
   * realId /真实的跟路径的id
   * realRoot /真实的跟路径的根路径
   * updateFile 真实的跟路径
   * type
   * callback回调
   */
  readOrUpdate(realId, realRoot, realFile, callback) {
    let stat = this.getMap(realId, realRoot, realFile)
    if (stat) {
      callback(null, stat);
    } else {
      this.getStat(realFile)
        .catch(e => {
          callback(e);
        })
        .then(stat => {
          callback(null, stat);
        }).catch(e=>{
          process.emit('uncaughtException',e);//promise 不能抛出异常，需要通过事件来触发系统错误捕获
        });
    }
  }
  update(realFile, realId, realRoot, callback) {
    this.system.input.purge("stat", realFile);

    this.getStat(realFile).catch(e => {
      callback(e);
    }).then(stat => {
      this.setMap(realFile, realId, realRoot, stat)
      callback(null, stat);
    }).catch(e=>{
      process.emit('uncaughtException',e);//promise 不能抛出异常，需要通过事件来触发系统错误捕获
    })
  }

  setMap(realFile, realId, realRoot, stat) {
    let relativefile = pt.dirname(realFile.replace(realRoot, ''))||"/";
    this.stateMap[realId] = this.stateMap[realId] || {}
    this.stateMap[realId][relativefile] = this.stateMap[realId][relativefile] || {}
    this.stateMap[realId][relativefile][pt.basename(realFile)] = stat;
  }

  getMap(realId, realRoot, realFile) {
    let relativefile = pt.dirname(realFile.replace(realRoot, ''))||"/";
    let stat = this.stateMap[realId] && this.stateMap[realId][relativefile] && this.stateMap[realId][relativefile][pt.basename(realFile)];
    return stat;
  }

}

module.exports = StaticFileState