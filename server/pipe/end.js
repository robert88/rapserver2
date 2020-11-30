const input = rap.system.input;

module.exports = function(run) {
  run.error.tapAsync({
    name: "end",
    stage: 4,
    fn(err, response, comeFrom, next) {
      //默认错误response
      if (response && response.finished == false) {
        response._header = null;
        response.removeHeader("Content-Length");
        response.setHeader("Content-Type", "text/plain");
        let code = 500;
        if (err && err.message.indexOf("ENOENT: no such file") != -1) {
          response.writeHead(404);
          code = 404;
        } else {
          response.writeHead(500);
        }
        if (run.config.page404 && code == 404) {
          input.exists(run.config.page404, flag => {
            if (flag) {
              let inp = fs.createReadStream(run.config.page404);
              inp.pipe(response);
            } else {
              response.end(comeFrom + ":" + (err && err.message));
            }
          })
        }
        else if (run.config.page500 && code == 500) {
          input.exists(run.config.page500, flag => {
            if (flag) {
              let inp = fs.createReadStream(run.config.page500);
              inp.pipe(response);
            } else {
              response.end(comeFrom + ":" + (err && err.message));
            }
          })
        } else {
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
      throw new Error("ENOENT: no such file or action：" + request.rap.url);
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