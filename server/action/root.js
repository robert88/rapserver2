//action: /rapserver/root
exports = module.exports = {
  /**
   * 添加path
   * */
  "add": function(req, res, next) {
    var run = this;
    var params = req.rap.query;
    if (!params.path || !params.rootId) {
      throwError("params error", MESSAGE);
      return;
    } else if (params.rootId == "rapserver") {
      throwError("can not change rapserver", MESSAGE);
      return;
    }
    rap.config.staticPathMap[params.rootId] = params.path;
    updateStaticPathMapCache();
    next(rap.config.staticPathMap);
  },
  /**
  删除path
  */
  "del": function(req, res, next) {
    var params = req.params;
    if (!params.rootId) {
      throwError("params error", MESSAGE);
      return;
    } else if (params.rootId == "rapserver") {
      throwError("can not del rapserver", MESSAGE);
      return;
    }
    delete rap.config.staticPathMap[params.rootId];
    updateStaticPathMapCache();
    next(rap.config.staticPathMap);
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