/*
 *
 * @title：rap框架
 * 用于构建通用的web程序
 * @author：尹明
 * */
global.ENV = process.argv[2] == "dev" ? "dev" : "product"

// 引入 events 模块
let events = require('events');
// 创建 eventEmitter 对象
global.event = new events.EventEmitter();

console.clear();

require("./lib/global/global.localRequire");


//启动开一个worker
if (ENV == "product") {
  const Clter = localRequire("@/server/bootstrap/Cluster.js");
  let cluster = Clter(webServerWorker);
  cluster && cluster.fork().send("start");
} else {
  webServerWorker();
}

/*
 * web server worker
 */

function webServerWorker() {

  const Sockie = localRequire("@/server/bootstrap/Sockie.js");

  let serverConfig = localRequire("@/server/config.js");

  localRequire("@/server/lib/global/global.js");

  localRequire("@/server/lib/rap/rap.js");

  const Runner = localRequire("@/server/bootstrap/Runner.js");

  serverConfig(config => {

    //配置了https那么会启动https,同时http服务器也会启动但是会跳转到https
    let run = new Runner(config);

    run.config = config

    //sockie
    var sockie = new Sockie(run, rap.console.log, port => {
      rap.console.log("web sockie listen:" + port);
      run.sockie.port = port;
    });

    run.sockie = sockie;

    //request数组中顺序代表执行顺序
    var inStagMap = {};
    ["init", "query", "cookie", "session", "login", "action", "stat", "end"].forEach((val, idx) => {
      inStagMap[val] = idx;
    });

    run.inPipe.interceptors.push({
      register: (tap) => {
        tap.stage = inStagMap[tap.name];
        var fn = tap.fn;
        tap.fn = function(request, response) {
          //响应结束或者发生错误时都结束
          if (response.finished || response.error) {
            return;
          }
          fn.apply(tap, arguments);
        }
      }
    })

    var errorStagMap = {};
    ["init", "end"].forEach((val, idx) => {
      errorStagMap[val] = idx;
    });
    run.error.interceptors.push({
      register: (tap) => {
        tap.stage = errorStagMap[tap.name];
        var fn = tap.fn;
        tap.fn = function(err, response, comefrom) {
          fn.apply(tap, arguments);
        }
      }
    })

    //测试环境
    //response数组中顺序代表执行顺序
    var outStagMap = {};
    ["init", "query", "cookie", "action", "stat","staticFile", "end"].forEach((val, idx) => {
      outStagMap[val] = idx;
    });
    run.outPipe.interceptors.push({
      register: (tap) => {
        tap.stage = outStagMap[tap.name];
        var fn = tap.fn;
        tap.fn = function(request, response) {
          if (response.finished || response.error) {
            return;
          }
          fn.apply(tap, arguments);
        }
      }
    })

    //http通道
    // 静态文件
    rap.console.log("默认静态根路径", JSON.stringify(config.staticList));
    rap.console.log("action 根目录", JSON.stringify(config.actionMap));
    localRequire("@/server/pipe/init.js")(run);
    localRequire("@/server/pipe/query.js")(run);
    localRequire("@/server/pipe/cookie.js")(run);
    localRequire("@/server/pipe/session.js")(run);
    localRequire("@/server/pipe/login.js")(run);
    localRequire("@/server/pipe/stat.js")(run, config.staticMap);
    localRequire("@/server/pipe/action")(run);
    localRequire("@/server/pipe/staticFile.js")(run);
    localRequire("@/server/pipe/end.js")(run);
    global.run = run;
    global.event.emit("run", run);

  })
}