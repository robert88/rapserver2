/*
 *
 * @title：rap框架
 * 用于构建通用的web程序
 * @author：尹明
 * */
require("./lib/global/global.localRequire");

localRequire("@/server/lib/global/global.js");

localRequire("@/server/lib/rap/rap.js");

const Runner = localRequire("@/server/bootstrap/Runner.js");
// const Cluser = localRequire("@/server/bootstrap/Cluser.js");
// const Sockie = localRequire("@/server/bootstrap/Sockie.js");
let config = localRequire("@/server/config.js");

let run = new Runner();

//数组中顺序代表执行顺序
var inStagMap = {};
["init", "cache", "query","staticFileSetId", "staticFile","end"].forEach((val, idx) => {
  inStagMap[val] = idx;
})
run.inPipe.interceptors.push({
    register: (tap) => {
      tap.stag = inStagMap[tap.name]
    }
  })
  

//数组中顺序代表执行顺序
var outStagMap = {};
["init", "cache", "query","staticFile", "end"].forEach((val, idx) => {
  outStagMap[val] = idx;
})
run.outPipe.interceptors.push({
  register: (tap) => {
    tap.stag = outStagMap[tap.name]
  }
})


localRequire("@/server/pipe/common.js")(run);
localRequire("@/server/pipe/cache.js")(run, config.staticMap);
localRequire("@/server/pipe/query.js")(run);
localRequire("@/server/pipe/staticFile.setId.js")(run4006,config.staticMap);
localRequire("@/server/pipe/staticFile.js")(run, config.staticMap);
// localRequire("@/server/pipe/filter/action")(run);
// localRequire("@/server/pipe/filter/action")(run);
// localRequire("@/server/pipe/filter/proxy")(run);
// localRequire("@/server/pipe/filter/permision")(run);


// localRequire("@/server/pipe/filter/responseEnd")(run);

// new Cluser(run);
// new Sockie(run);

module.exports = run;