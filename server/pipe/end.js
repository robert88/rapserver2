const input = rap.system.input;
const pt = require("path");
const mineType = localRequire("@/server/lib/staticFile.extname.js")

module.exports = function(run) {
  run.error.tapAsync({
    name: "end",
    stage: 4,
    fn(err, response, comeFrom, next) {
      //默认错误response
      if (response && response.finished == false) {
        response._header = null; //清空头部信息
        response.removeHeader("Content-Length");
        var ext = pt.extname(response.rap && response.rap.url || "").replace(".", "")
        let code = 500;
        var message = err && err.message||"";
        if (message.indexOf("ENOENT: no such file") != -1) {
          code = 404;
        }
        if (message.indexOf("Unauthorized") != -1) {
          code = 401;
        }
        if (message.indexOf("Request Timeout") != -1) {
          code = 408;
        }

        if (code == 404) {
          if (ext == "html" || ext == "" || ext == "htm") {
            //确保当前404页面不是自己，否则死循环
            if (run.config.page404 && response.rap.url != run.config.page404) {
              response.setHeader("Location", run.config.page404);
              response.writeHead(301);
              response.end();
              return;
            }
          }
        }

        response.setHeader("Content-Type", [((ext && mineType[ext]) || "text/plain")]);
        response.writeHead(code);
        response.end(comeFrom + ":" + (err && err.message));

      }
      next()
    }
  })

  //当前没有找到文件或者action数据信息
  run.outPipe.tapAsync({
    name: "end",
    fn(request, response, next) {
      throw new Error("ENOENT: no such file or action：" + response.rap.url);
    }
  });


}