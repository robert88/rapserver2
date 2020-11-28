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
  init(callback) {
    let staticPathMap = this.staticPathMap;
    var asyncArr = [];
    for (let id in staticPathMap) {
      //必须传递function不能用箭头函数
      asyncArr.push(function() {
        var queue = this;
        this.initOne(id, staticPathMap[id], (err, item) => {
          queue.next();
        })
      })
    }

    //异步处理
    new AsyncSeries(asyncArr, (err) => {
      callback();
    })
  }

  initOne(id, root, callback) {
    let stateMap = {};
    let tempDir = this.tempDir
    // 参数：path, fileType, deep, filterFn, callback
    this.system.input.findAll(root, null, true, null, (err, allFile) => {
      if (err) {
        throw err;
      }
      allFile.forEach(file => {
        let relativefile = file.replace(root, '');
        stateMap[relativefile] = this.getStat(file);
      })
      let jsonFile = tempDir + "/" + id + ".json";
      this.system.output.write(jsonFile, JSON.stringify({ root: root, map: stateMap }), err => {
        if (err) {
          throw err;
        }
        this.system.input.purge("all", jsonFile);
        callback(err, stateMap)
      })

    })

  }

  /*获取单个文件的stat信息*/
  getStat(file) {
    let stat = {};
    let statInfo = this.system.input.statSync(file);
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
    return this.tempDir + "/" + realId + ".json";

  }

  /*更新单个文件的stat信息
   * realId /真实的跟路径的id
   * realRoot /真实的跟路径的根路径
   * updateFile 真实的跟路径
   * type
   * callback回调
   */
  readOrUpdate(realId, realRoot, updateFile, type, callback) {

    var jsonFile = this.getStatFile(realId, realRoot, updateFile);

    if (!jsonFile) {
      callback(new Error("not find cache file"));
      return;
    }

    this.system.input.readJson(jsonFile, (err, data) => {
      if (err) {
        data = { map: {}, root: realRoot };
      }
      let relativefile = updateFile.replace(realRoot, '');
      //获取信息
      if (type == "update") {
        this.system.input.purge("stat", updateFile);
        data.map[relativefile] = this.getStat(updateFile);
        this.system.output.writeSync(jsonFile, JSON.stringify(data))
        this.system.input.purge("all", jsonFile);
      }
      callback(null, data.map[relativefile]);
      data = null;

    })
  }

}

module.exports = StaticFileState