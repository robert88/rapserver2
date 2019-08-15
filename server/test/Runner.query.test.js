//测试
require("../lib/global/global.localRequire");
localRequire("@/server/lib/rap/rap.js");
const run4000 = localRequire("@/server/test/RunnerTest4000.js")
localRequire("@/server/pipe/query.js")(run4000);
test("test http server 4000 query", function(done) {
  let req;
  run4000.pipe.tapAsync({
    name: "querytest",
    after:"query",
    fn(request, response, next){
      req = request.rap;
      next();
    }})

  run4000.ready(() => {
    rap.rest({
      url: "http://localhost:4000/?jsv=2.4.8&a=true&appKey=12574478&t=%E4%B8%AD%E5%9B%BD&t=%E4%B8%AD%E5%9B%BD%E4%BA%BA",
      method:"get",
      success: function(ret) {
        expect(ret).toBe("helloworld");
        expect(req.url).toBe("/")
        expect(req.port).toBe(4000)
        expect(req.query.jsv).toBe("2.4.8")
        expect(req.query.a).toBe(true)
        expect(req.query.t).toEqual(["中国","中国人"])
        done();
        run4000.close();
      }
    });
  })

}, 100000)

