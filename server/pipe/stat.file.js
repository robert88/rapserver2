const pt = require("path");
const AsyncSeries = localRequire("@/server/lib/node_modules/enhanced-resolve/lib/AsyncSeries.js")

/*
 *将文件信息统计到一个json文件中
 */
class StaticFileState {
  constructor(staticStateMap, system, tempDir, log) {
    this.staticStateMap = staticStateMap;
    this.system = system;
    this.tempDir = tempDir;
    this.log = log || { warn: function() {} }
    if (!staticStateMap) {
      this.log.warn("warning not find static file path");
      return;
    }
    this.init().catch(e => { console.error(e && e.message, e && e.stack) });
  }
  //多是异步的
  async init() {
    let staticStateMap = this.staticStateMap;
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
    let stateMap = {};
    for (var i = 0; i < allFile.length; i++) {
      let file = allFile[i];
      let relativefile = pt.dirname(file.replace(root, ''));
      relativefile = relativefile || "/";
      stateMap[id] = stateMap[id] || {};
      stateMap[id][relativefile] = stateMap[id][relativefile] || {}
      stateMap[id][relativefile][pt.basename(file)] = await this.getStat(file);
    }
    this.stateMap = stateMap;
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

    let relativefile = pt.dirname(realFile.replace(realRoot, ''));
    relativefile = relativefile || "/";
    let stat = this.stateMap[realId] && this.stateMap[realId][relativefile] && this.stateMap[realId][relativefile][pt.basename(realFile)];
    if (stat) {
      callback(stat);
    } else {
      this.getStat(realFile).then(stat => {
        callback(stat);
      }).catch(e => {
        throw e;
      })
    }
  }

}

module.exports = StaticFileState