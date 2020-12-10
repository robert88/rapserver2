const input = rap.system.input;
const pt = require("path");

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

        if (err && err.message.indexOf("ENOENT: no such file") != -1) {
          code = 404;
        }
        if (err && err.message.indexOf("Unauthorized") != -1) {
          code = 401;
        }
        if (err && err.message.indexOf("Request Timeout") != -1) {
          code = 408;
        }

        if (code == 404) {
          if (ext == "html" || ext == "" || ext == "htm") {
            input.exists(run.config.page404, flag => {
              if (flag) {
                response.setHeader("Content-Type", ["text/html"])
                response.writeHead(200);
                let inp = fs.createReadStream(run.config.page404);
                inp.pipe(response);
              } else {
                response.writeHead(code);
                response.setHeader("Content-Type", ["text/plain"]);
                response.end(comeFrom + ":" + (err && err.message));
              }
            })
          }

        } else {
          input.exists(run.config.page500, flag => {
            if (flag) {
              response.setHeader("Content-Type", ["text/html"])
              response.writeHead(200);
              let inp = fs.createReadStream(run.config.page500);
              inp.pipe(response);
            } else {

              response.writeHead(code);
              response.end(comeFrom + ":" + (err && err.message));
            }
          })
        } else {
          response.setHeader("Content-Type", ["text/plain"]);
          response.writeHead(code);
          response.end(comeFrom + ":" + (err && err.message));
        }

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

  //默认response
  // run.outPipe.tapAsync({
  //   name: "end",
  //   stage: 4,
  //   fn(request, response, next) {
  //     response._header = null;
  //     response.removeHeader("Content-Length");
  //     response.setHeader("Content-Type", "text/plain");
  //     response.writeHead(200);
  //     response.end("helloworld");
  //   }
  // })
}