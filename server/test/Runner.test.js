//测试
require("../lib/global/global.localRequire");
localRequire("@/server/lib/rap/rap.restful.js");
const run4000 = localRequire("@/server/test/RunnerTest4000.js")
const run4001 = localRequire("@/server/test/RunnerTest4001.js")
test("test http server 4001", function(done) {
  run4000.ready(() => {
    rap.restful({
      url: "http://localhost:4000",
      success: function(ret) {
        expect(ret).toBe("helloworld");
        done();
        run4000.close();
      }
    });
  })

}, 100000)



test("test http server 4000 handler error", function(done) {
  run4001.ready(() => {
    rap.restful({
      url: "http://localhost:4001",
      success: function(ret) {
        expect(ret).toBe("helloworld");
        done();
        run4001.close();
      }
    });
  })

}, 100000)