//测试
require("../lib/global/global.localRequire");
const Runner = localRequire("@/server/bootstrap/Runner.js");
const AsyncParallelBailHook = localRequire("@/server/lib/node_modules/tapable/AsyncParallelBailHook.js")
localRequire("@/server/lib/rap/rap.restful.js");

test("test http server 3005", function(done) {
  let run = new Runner({ port:3005 });
  rap.restful({
    url: "http://localhost:3005",
    success: function(ret) {
      expect(ret).toBe("helloworld");
      done();
      run.close();
    }
  });
},100000)


test("test http server 3006 handler error", function(done) {
  let run = new Runner({ port:3006 });
  run.pipe.tapAsync({
    name:"asyncThrowError",
    fn(request,response,callback) {
      setTimeout(()=>{
        throw Error("test async error");
        callback();
      },10)
    }
  });

  rap.restful({
    url: "http://localhost:3006",
    success: function(ret) {
      expect(ret).toBe("helloworld");
      done();
      run.close();
    }
  });
},100000)