//action: /rapserver/root
exports = module.exports = {
  /**
   * 添加path
   * */
  "add": function(req, res, next) {
    var run = this;
    var params = req.rap.query;
    if (!params.path || !params.rootId) {
      throw Error("params error");
    } else if (params.rootId == "rapserver") {
      throw Error("can not change rapserver");
    }
    run.config.staticMap[params.rootId] = params.path;
    run.state.init(run.config.staticMap);
    next(run.config.staticMap);
  },
  /**
  删除path
  */
  "del": function(req, res, next) {
    var run = this;
    var params = req.rap.query;
    if (!params.rootId) {
      throw Error("params error");
    } else if (params.rootId == "rapserver") {
      throw Error("can not change rapserver");
    } else if (run.config.staticMap[params.rootId]) {
      delete run.config.staticMap[params.rootId];
      run.state.init(run.config.staticMap);
    }
    next(run.config.staticMap);
  },
  /**
   获取 path
   */
  "get": function(req, res, next) {
    let run = this;
    next(Object.assign({}, run.config.staticMap));
  },
  /**
   获取 全部html
   */
  "allHtml": function(req, res, next) {
    asyncFindAllFile(req).then(function(map) {
      next(map);
    })
  }
}