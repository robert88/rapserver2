const http = require("http");
const https = require("https");
const domain = require('domain');
const fs = require("fs");

const AsyncSeriesWaterfallHook = localRequire("@/server/lib/node_modules/tapable/AsyncSeriesWaterfallHook.js");

//初始化必要的全局变量

global.rap = global.rap || {};

rap.runnerStack = [];


module.exports = class Runner {

  constructor(options) {
    //存储未完成的response
    this.responseStack = [];

    options = options || {};

    this.inPipe = new AsyncSeriesWaterfallHook(["request", "response"]);
    this.outPipe = new AsyncSeriesWaterfallHook(["request", "response"]);
    this.update = new AsyncSeriesWaterfallHook(["ret", "request", "response"]);
    this.error = new AsyncSeriesWaterfallHook(["err", "response", "comeFrom"]);
    this.uuid = 0;


    //创建http服务
    this.readyStack = [];
    this.status = "ready";
    if (options.https) {
      this.server = https.createServer(options.https, this.middleware.bind(this)).listen(options.https.port || 3004, () => {
        this.status = "started";
        this.ready();
        rap.console.log("server https run port " + (options.https.port || 3004));

        //启动http
        http.createServer(function() {
        }).listen(options.http.port || 3005, () => {
          rap.console.log("server http run port " + (options.http.port || 3005));
        });
      });


    } else {
      this.server = http.createServer(this.middleware.bind(this)).listen(options.http.port || 3003, () => {
        this.status = "started";
        this.ready();
        rap.console.log("server http run port " + (options.port || 3003));
      });

    }


    rap.runnerStack.push(this);
  }

  ready(fn) {
    if (typeof fn == "function") {
      this.readyStack.push(fn);
    }
    if (this.status == "started") {
      this.readyStack.forEach((fn) => {
        fn();
      });
      this.readyStack.length = 0
    }
  }


  close() {
    this.clear();
    this.server.close();
    if (this.serverHttps) {
      this.serverHttps.close();
    }
    this.inPipe.taps = [];
    this.inPipe._resetCompilation();
    this.outPipe.taps = [];
    this.outPipe._resetCompilation();
  }
  middleware(request, response) {
    //清除无用的response
    this.clear();
    this.responseStack.push(response);
    this.uuid++;
    this.try(request, response)
  }

  //捕获异步异常
  try (request, response) {

    //用于标识请求
    request.maskIndex = this.uuid;
    response.maskIndex = this.uuid;

    let d = domain.create();

    //捕获异步异常
    d.on('error', (err) => {

      rap.console.error("error:", err.stack,"domainErrorEvent")

      this.error.callAsync(err, response, "domainErrorEvent", () => {
        d = null;
      });

    });

    d.run(() => {
      //捕获同步异常
      try {
        this.handler(request, response);
      } catch (err) {
        rap.console.error("error:", err.stack,"trycatch")
        this.error.callAsync(err, response, "trycatch", () => {
          err = null;
          d = null;
        });
      }
    });


  }

  clear(filter) {
    let ret = [];
    this.responseStack.forEach(function(response) {
      //filter can return false aways responseCache will empty
      if (typeof filter == "function" && filter(response) === false) {
        return;
      }
      if (response && response.finished == false) {
        ret.push(response);
      }
    });
    this.responseStack = ret;
    ret = null;
  }
  //处理请求
  handler(request, response) {

    this.inPipe.callAsync(request, response, (err) => {
      if (err) {
        this.error.callAsync(err, response, "inPipeException");
      } else {
        this.outPipe.callAsync(request, response, (err) => {
          if (err) {
            this.error.callAsync(err, response, "outPipeException");
          }
        })
      }
    });

  }
}

//服务器挂了
process.on('uncaughtException', function(err) {
  rap.runnerStack && rap.runnerStack.forEach(runner => {
    runner.responseStack.forEach((response) => {
      runner.error.callAsync(err, response, "uncaughtException", () => {
        runner.clear();
      });
    })
  });
  rap.console&&rap.console.error(err.stack);
});