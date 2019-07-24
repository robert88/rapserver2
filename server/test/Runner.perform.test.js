//测试
require("../lib/global/global.localRequire");
localRequire("@/server/lib/rap/rap.restful.js");
const AsyncParallelBailHook = localRequire("@/node_modules/tapable/lib/AsyncParallelBailHook.js")
const run4002 = localRequire("@/server/test/RunnerTest4002.js")

//This test need starting a 3003 server by other terminal, and jest is a single thread that can only test 5000 requests.
test("test http server:4002 parallel require 5000", (done) => {

  run4002.ready(()=> {

    var parallel = new AsyncParallelBailHook();

    var arr = [...Array(5000)];
    var testFn = jest.fn();

    arr.forEach(() => {
      parallel.tapAsync("test", function(callback) {
        rap.restful({
          url: "http://localhost:4002",
          success(ret) {
            testFn = null;
            expect(ret).toBe("helloworld");
            callback();
          },
          error(err) {
            testFn && testFn();
            callback(err);
          }
        })
      });
    })

    parallel.callAsync(function() {
      if (testFn) {
        expect(testFn).toHaveBeenCalledTimes(arr.length);
      }
      done();
      run4002.close();
    });


  });

}, 1000 * 600);