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

    let run = new Runner({ port: config.port });

    //sockie
    var sockie = new Sockie(run, rap.console.log, port => {
      console.log("web sockie listen:" + port);
    });

    //request数组中顺序代表执行顺序
    var inStagMap = {};
    ["init", "cache", "query", "cookie", "session", "action", "staticFileSetId", "staticFile", "end"].forEach((val, idx) => {
      inStagMap[val] = idx;
    })
    run.inPipe.interceptors.push({
      register: (tap) => {
        tap.stag = inStagMap[tap.name]
      }
    })


    //response数组中顺序代表执行顺序,actionEnd会把end给覆盖掉
    var outStagMap = {};
    ["init", "cache", "query", "cookie", "staticFile", "actionEnd", "end"].forEach((val, idx) => {
      outStagMap[val] = idx;
    })
    run.outPipe.interceptors.push({
      register: (tap) => {
        tap.stag = outStagMap[tap.name]
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