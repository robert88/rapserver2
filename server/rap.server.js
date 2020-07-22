/*
 *
 * @title：rap框架
 * 用于构建通用的web程序
 * @author：尹明
 * */
global.ENV = process.argv[2] == "dev" ? "dev" : "product"

require("./lib/global/global.localRequire");


//启动开一个worker
if (ENV == "product") {
  const Clter = localRequire("@/server/bootstrap/Cluster.js");
  let cluster = Clter(webServerWorker);
  cluster && cluster.fork().send("start");
} else {
  webServerWorker(true);
}

/*
 * web server worker
 */

function webServerWorker(httpsFlag) {

  const Sockie = localRequire("@/server/bootstrap/Sockie.js");

  let serverConfig = localRequire("@/server/config.js");

  localRequire("@/server/lib/global/global.js");

  localRequire("@/server/lib/rap/rap.js");

  const Runner = localRequire("@/server/bootstrap/Runner.js");

  serverConfig(config => {
    let run;

    if (httpsFlag) {
      run = new Runner({ port: config.port || 443, https: config.https });
    } else {
      run = new Runner({ port: config.port || 80 });
    }

    //sockie
    var sockie = new Sockie(run, rap.console.log, port => {
      console.log("web sockie listen:" + port);
    });

    //request数组中顺序代表执行顺序
    var inStagMap = {};
    ["init", "cache", "query", "cookie", "session", "action", "staticFileSetId", "staticFile", "end"].forEach((val, idx) => {
      inStagMap[val] = idx;
    });

    run.inPipe.interceptors.push({
      register: (tap) => {
        tap.stage = inStagMap[tap.name];
        var fn = tap.fn;
        tap.fn = function(request) {
          console.log("in:", request.maskIndex, tap.name)
          fn.apply(tap, arguments);
        }
      }
    })
    
    //测试环境
    if (ENV !== "product") {
      run.error.tapAsync({
        name: "debuger",
        fn: function(err, response, comeFrom, next) {
          console.error(err && err.stack, comeFrom);
          next();
        }
      })
    }

    //response数组中顺序代表执行顺序,actionEnd会把end给覆盖掉
    var outStagMap = {};
    ["init", "cache", "query", "cookie", "staticFile", "actionEnd", "end"].forEach((val, idx) => {
      outStagMap[val] = idx;
    })
    run.outPipe.interceptors.push({
      register: (tap) => {
        tap.stage = outStagMap[tap.name];
        var fn = tap.fn;
        tap.fn = function(request) {
          console.log("out:", request.maskIndex, tap.name)
          fn.apply(tap, arguments);
        }
      }
    })

    //http通道
    localRequire("@/server/pipe/common.js")(run);
    localRequire("@/server/pipe/cache.js")(run, config.staticMap);
    localRequire("@/server/pipe/query.js")(run);
    localRequire("@/server/pipe/cookie.js")(run);
    localRequire("@/server/pipe/session.js")(run);
    localRequire("@/server/pipe/login.js")(run);
    localRequire("@/server/pipe/action")(run, config.actionPath);
    localRequire("@/server/pipe/staticFile.setId.js")(run, config.staticMap);
    localRequire("@/server/pipe/staticFile.js")(run, config.staticMap);

  })
}