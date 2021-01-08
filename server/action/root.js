var pt = require("path");
const { resolve, getDefaultFile } = localRequire("@/server/lib/resolveFile.js");
const StaticFileState = localRequire("@/server/lib/StaticFileState.js");
//找到对应的配置
function findRootId(run, path) {
  var realFile, realId, realRoot, staticList = run.config.staticList;
  for (var key in staticMap) {
    var item = staticMap[key];
    if (path.indexOf(item) == 0) {
      realFile = getDefaultFile(path);
      realId = key;
      realRoot = item;
      break;
    }
  }
  return { realFile, realId, realRoot }
}

//寻找根目录
function makeSureRoot(run, path, callback) {
  //使用绝对路径来查询
  var { realFile, realId, realRoot } = findRootId(run, path);
  if (realId) {
    callback(null, realFile, realId, realRoot);
    //使用相对路径
  } else {
    resolve(run, run.config.staticMap, path, (err, realFile, realId, realRoot) => {
      callback(err, realFile, realId, realRoot);
    })
  }
}


//文件
function updateStaticStat(run, path, next) {
  makeSureRoot(run, path, (err, realFile, realId, realRoot) => {
    if (!realFile) {
      err = new Error("ENOENT: no such file or directory");
    }
    if (err) {
      rap.console.error("action:clearCache by file:", err.stack);
      next(0);
    } else {
      run.state.update(realFile, realId, realRoot, function(err, ret) {
        if (err) {
          next(0);
        } else {
          next(1);
        }
      });
    }
  })
}

//目录
function updateDirStat(run, path, next) {
  makeSureRoot(run, path, (err, realFile, realId, realRoot) => {
    if (err) {
      return next(0);
    }
    rap.console.log("action:clearCache by dir", realFile, realId, realRoot);
    rap.system.input.purpe(); //清除全部缓存
    rap.system.input.findAll(realFile, null, true, null, (err, allFile) => {
      if (err) {
        return next(0);
      }

      var fail = 0;
      var success = 0;
      allFile.forEach(file => {
        run.state.update(file, realId, realRoot, function(err, ret) {
          if (err) {
            fail++;
          } else {
            success++;
          }
          if (fail + success == allFile.length) {
            if (success) { //部分成功也是成功
              next(1)
            } else {
              next(0)
            }
          }
        });
      })
    })
  })
}


//action: /rapserver/root
exports = module.exports = {
  "/favicon.ico": "/rapserver/favicon.ico",
  /**
   * 添加path
   * */
  "add": function(req, res, next) {
    var run = this;
    var params = res.rap.query;
    if (!params.path || !params.rootId) {
      throw Error("params error");
    } else if (params.rootId == "rapserver") {
      throw Error("can not change rapserver");
    }
    run.config.staticList.push({name:params.rootId,path:params.path});
    var stat = new StaticFileState();
    stat.init(run.config.staticList).catch(e => {
      rap.console.error(e)
    }).then(item => {
      run.stat = stat;
      stat = null;
      next(Object.assign({}, run.config.staticList));
    });
  },
  /**
  删除path
  */
  "del": function(req, res, next) {
    var run = this;
    var params = res.rap.query;
    if (!params.rootId) {
      throw Error("params error");
    } else if (params.rootId == "rapserver") {
      throw Error("can not change rapserver");
    } else {
      for (let i = 0; i < run.config.staticList; i++) {
        let item = run.config.staticList[i];
        if (item.name == rootId) {
          run.config.staticList.splice(i, 1);
          break;
        }
      }
      var stat = new StaticFileState();
      stat.init(run.config.staticList).catch(e => {
        rap.console.error(e)
      }).then(item => {
        run.stat = stat;
        stat = null;
        next(Object.assign({}, run.config.staticList));
      });
    }
  },
  /**
   获取 path
   */
  "get": function(req, res, next) {
    let run = this;
    next(Object.assign({}, run.config.staticList));
  },
  /**
   获取 全部html
   */
  "allHtml": function(req, res, next) {
    asyncFindAllFile(req).then(function(map) {
      next(map);
    })
  },
  //清除缓存
  "clearCache": function(req, res, next) {
    var run = this;
    var path = res.rap.query.path;
    var type = res.rap.query.type;
    // var time = res.rap.time;
    if (!path || !type) {
      throw Error("params error");
    }
    if (type == "file") {
      updateStaticStat(run, path, function(ret) {
        next(ret);
      });
      //action
    } else if (type == "action") {
      run.action.update(path);
      next(1);
      //目录
    } else {
      updateDirStat(run, path, function(ret) {
        next(ret);
      });
    }

  }
}