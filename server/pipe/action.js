const Action = localRequire("@/server/lib/Action.js");

module.exports = function(runner) {
  //action是个map，可以配置多个目录的action
  if (!runner.config.actionMap) {
    console.log("not set action");
    return;
  }

  //得到一个action对象
  runner.action = new Action(rap.system, runner.config.actionMap);

  runner.inPipe.tapAsync({
    name: "action",
    fn(request, response, next) {
      if (response.rap.action) {
        next();
      } else {

        runner.action.run(runner, request, response, mapInfo => {
          //得到是一个文件
          if (mapInfo.type == "file") {
            response.rap.url = mapInfo.value;
            //得到是一个数据
          } else if (mapInfo.type == "remote") {
            response.rap.redirect = mapInfo.value;
          } else if (mapInfo.type == "data") {
            response.rap.action = mapInfo.value;
          }
          next();
        }, {});

      }
    }
  });

  runner.outPipe.tapAsync({
    name: "action",
    fn(request, response, next) {
      if (response.rap.action) {
        let ret = response.rap.action;
        if (typeof ret == "string") {
          response.setHeader("Content-Type", ["text/plain"])
        } else if (typeof ret == "object") {
          if (Buffer.isBuffer(ret)) {
            //这个应该怎么处理？
          } else {
            response.setHeader("Content-Type", ["application/json"])
            ret = JSON.stringify(ret)
          }

        } else {
          ret = ret + "";
        }
        response.writeHead(200);
        response.end(ret);
      } else if (response.rap.redirect) {
        response.setHeader("Location", response.rap.redirect)
        response.writeHead(301);
        response.end();
      } else {
        next();
      }
    }
  })

}