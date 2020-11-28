const loginIntercept = localRequire("@/server/intercept/login.js")



module.exports = function(run) {
  run.inPipe.tapAsync({
    name: "login",
    fn(request, response, next) {
      //这个是
      var loginWrap = loginIntercept.wrap((req, res, actionNext) => { next() });
      var splitUrl = request.rap.url.split("/");
      var needLoginWrap = false;
      if (loginIntercept.path.size == 0) {
        next();
        return;
      }
      //寻找匹配的路径
      splitUrl.forEach((val, idx) => {
        var p = splitUrl.slice(0, idx + 1).join("/");
        if (p && loginIntercept.path.has(p)) {
          needLoginWrap = true;
          return false;
        }
      })
      if (needLoginWrap) {
        //这里特别容易把next认为是action的next,不需要拦截走的是next，需要拦截的走的是actionNext
        loginWrap(request, response, (loginPath) => {
          request.rap.url = loginPath;
          next()
        });
      } else {
        next()
      }
    }
  })
}