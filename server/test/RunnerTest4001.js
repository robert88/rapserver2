/*
*
* @title：rap框架
* 用于构建通用的web程序
* @author：尹明
* */

const Runner = localRequire("@/server/bootstrap/Runner.js");

let run = new Runner({port:4001});

run.inPipe.tap({
    name:"requestCount",
    fn(request,response){
        console.clear();
       console.log(run.responseStack.length);
    }
});

// 异步测试
// run.inPipe.tapAsync({
//   name:"asyncThrowError",
//   fn(request,response,callback) {
//     setTimeout(()=>{
//       throw Error("test async error");
//       callback();
//     },10)
//   }
// });

module.exports = run;
