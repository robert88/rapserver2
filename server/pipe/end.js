//合并公共信息
run.inPipe.tapAsync({
  name: "end",
  fn(request, response, next) {
    clearTimeout(request.rap.timer); //防止request处理超时
    next();
  }
});


this.error.tapAsync({
  name: "end",
  stage: 4,
  fn(err, request, response, comeFrom, next) {
    //默认错误response
    if (response && response.finished == false) {
      response._header = null;
      response.removeHeader("Content-Length");
      response.setHeader("Content-Type", "text/plain");
      if (err && err.message.indexOf("ENOENT: no such file") != -1) {
        response.writeHead(404);
      } else {
        response.writeHead(500);
      }
      response.end(comeFrom + ":" + (err && err.message));
    }
    next()
  }
})

//合并公共信息
run.outPipe.tapAsync({
  name: "end",
  fn(request, response, next) {
    if (!response.finished) {
      throw new Error("not find file or action:" + request.rap.url);
    }
    next();
  }
});

//默认response
this.outPipe.tapAsync({
  name: "end",
  stage: 4,
  fn(request, response, next) {
    if (response && response.finished == false) {
      response._header = null;
      response.removeHeader("Content-Length");
      response.setHeader("Content-Type", "text/plain");
      response.writeHead(200);
      response.end("helloworld");
    }
  }
})