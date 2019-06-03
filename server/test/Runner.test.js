//测试
require("../lib/global/global.localRequire");
const Runner = localRequire("@/server/bootstrap/Runner.js");
const AsyncParallelBailHook = localRequire("@/server/lib/node_modules/tapable/AsyncParallelBailHook.js")
localRequire("@/server/lib/rap/rap.restful.js");

test("test empty http server", function(done) {
  let run = new Runner();
  rap.restful({
    url: "http://localhost:3003",
    success: function(ret) {
      expect(ret).toBe("helloworld");
      done();
      run.close();
    }
  })
})

test("test empty http server", (done)=> {
  let run = new Runner({ port: 3005 });
  var parallel = new AsyncParallelBailHook();
  var arr = [...Array(300)];
  arr.forEach(() => {
    parallel.tapAsync("test", function(callback) {
      rap.restful({
        url: "http://localhost:3005",
        success: function(ret) {
      expect(ret).toBe("helloworld");
      console.log(1)
          callback();
        }
      })
    });
  })

parallel.callAsync(function() {
    done();
  });

},1000*600);