const pt = require("path");
const AsyncSeries = localRequire("@/server/lib/node_modules/enhanced-resolve/lib/AsyncSeries.js")

/*
 *将文件信息统计到一个json文件中
 */
class StaticFileState {
  constructor(staticPathMap, system, tempDir, log) {
    this.staticStateMap = staticPathMap;
    this.system = system;
    this.tempDir = tempDir;
    this.log = log || { warn: function() {} }
    if (!staticPathMap) {
      this.log.warn("warning not find static file path");
      return;
    }
  }
  //多是异步的
  async init() {
    let staticPathMap = this.staticPathMap;
    for (let id in staticPathMap) {
      await this.initOne(id, root);
    }
  }

  async initOne(id, root) {
    return await new Promise((resove, reject) => {
      // 参数：path, fileType, deep, filterFn, callback
      this.system.input.findAll(root, null, true, null, (err, allFile) => {
        if (err) {
          reject(err);
        }
        this.getAllStat(id, root, allFile).then(stateMap => {
          return this.writeStat(stateMap);
        }).then(() => {
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
      let relativefile = id + "/" + pt.dirname(file.replace(root, ''));
      stateMap[relativefile] = stateMap[relativefile] || {}
      stateMap[relativefile][pt.basename(file)] = await this.getStat(file);
    }
    return stateMap;
  }

  async writeStat(stateMap) {
    let tempDir = this.tempDir;
    for (let dir in stateMap) {
      var map = stateMap[dir]
      var jsonFile = (tempDir + "/" + dir.replace(/\/+$/g, "") + ".json").toURI();
      await new Promise((resove, reject) => {
        this.system.output.write(jsonFile, JSON.stringify(map), err => {
          if (err) {
            reject(err);
          }
          this.system.input.purge("all", jsonFile);
          resove(map)
        })
      })
    }
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
  getStatFile(realId, realRoot, updateFile) {

    if (!updateFile) {
      this.log.warn("warning not find real file path", updateFile);
      return;
    }

    if (!realId) {
      this.log.warn("warning not find real file root id", realId);
      return;
    }

    if (!realRoot) {
      this.log.warn("warning not find real file root path", realRoot);
      return;
    }
    return ((this.tempDir + "/" + realId + "/" + pt.dirname(updateFile)).replace(/\/+$/g, "") + ".json").toURI();


  }

  /*更新单个文件的stat信息
   * realId /真实的跟路径的id
   * realRoot /真实的跟路径的根路径
   * updateFile 真实的跟路径
   * type
   * callback回调
   */
  readOrUpdate(realId, realRoot, realFile, type, callback) {

    var jsonFile = this.getStatFile(realId, realRoot, realFile.replace(realRoot, ""));

    if (!jsonFile) {
      throw new Error("not find cache file")
    }

    this.system.input.readJson(jsonFile, (err, data) => {
      if (err) {
        throw err;
      }
      data = data || {};
      let filename = pt.basename(realFile);
      //获取信息
      if (type == "update" || !data[filename]) {
        this.system.input.purge("stat", realFile);
        this.getStat(realFile).then(statInfo => {
          data[filename] = statInfo;
          this.system.output.write(jsonFile, JSON.stringify(data), err => {
            if (err) {
              throw err;
            }
            this.system.input.purge("all", jsonFile);
          })
          callback(statInfo);
          data = null;
        });
      } else {
        callback(data[filename]);
        data = null;
      }


    })
  }

}

module.exports = StaticFileState