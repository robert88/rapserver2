/*
*
* @title：rap框架
* 用于构建通用的web程序
* @author：尹明
* */
require("./lib/global/global.localRequire");

const Runner = localRequire("@/server/bootstrap/Runner.js");

let run = new Runner();

run.pipe.tap({
    name:"requestCount",
    fn(request,response){
        console.clear();
       console.log(run.responseStack.length);
    }
});

// 异步测试
run.pipe.tapAsync({
  name:"asyncThrowError",
  fn(request,response,callback) {
    setTimeout(()=>{
      throw Error("test async error");
      callback();
    },10)
  }
});

//同步测试
// run.pipe.tapAsync({
//     name:"throwError",
//     fn(request,response,callback) {
//         throw Error("test async error");
//         callback();
//     }
//   });
// const Cluser = localRequire("@/server/bootstrap/Cluser.js");
// const Sockie = localRequire("@/server/bootstrap/Sockie.js");

//全局变量

// localRequire("@/server/lib/global/global.js");
// localRequire("@/server/lib/rap/rap.js");
// let config = localRequire("@/server/config.js");

// localRequire("@/server/pipe/filter/query")(run);
// localRequire("@/server/pipe/filter/action")(run);
// localRequire("@/server/pipe/filter/action")(run);
// localRequire("@/server/pipe/filter/proxy")(run);
// localRequire("@/server/pipe/filter/permision")(run);
// localRequire("@/server/pipe/filter/getRealFile")(run);
// localRequire("@/server/pipe/filter/getCache")(run);
// localRequire("@/server/pipe/filter/responseEnd")(run);

// new Cluser(run);

// new Sockie(run);

