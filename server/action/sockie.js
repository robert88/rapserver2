//action: /rapserver/root
exports = module.exports = {
  /**
   * 获得端口
   * */
  "port": function(req, res, next) {
    var run = this;
    next({port:run.sockie.port});
  },
  
}