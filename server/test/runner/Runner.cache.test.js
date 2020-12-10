//测试
require("../lib/global/global.localRequire");
localRequire("@/server/lib/rap/rap.js");
const fs =require("fs");
const Runner = localRequire("@/server/bootstrap/Runner.js");
let run4005 = new Runner({ port: 4005 });
localRequire("@/server/pipe/common.js")(run4005);
localRequire("@/server/pipe/cache.js")(run4005, { rapserver: localRequire("@/server/test/testCache", true) });

const testPath1 = localRequire("@/server/test/testCache/index.html", true)
const testPath2 = localRequire("@/server/test/testCache/index.png", true)
const testPath3 = localRequire("@/server/test/testCache/index.js", true)
rap.system.output.writeSync(testPath1, "hello world1!");
rap.system.output.writeSync(testPath2, "hello world1!");
rap.system.output.writeSync(testPath3, "hello world1!");

let req;
run4005.inPipe.tapAsync({
  name: "cacheTest",
  before: "cache",
  fn(request, response, next) {
    response.rap = response.rap || {};
    req = response.rap
    req.realFile = testPath1;
    req.realId = "rapserver"
    req.realRoot = localRequire("@/server/test/testCache", true);
    req = response.rap;
    next();
  }
})

run4005.outPipe.tapAsync({
  name: "cacheTest",
  fn(request, response, next) {
    var filePath = response.rap.realFile;
    //存在静态文件
    if (!filePath) {
      next();
      return;
    }
    response.writeHead(200);

    let inp = fs.createReadStream(filePath);
    inp.pipe(response);
  }
})



// //错误信息会被启动的服务捕获
test("test http server 4005 get cache", function(done) {

function restCache(callback, time, loop) {
  loop = loop || { count: 0, modify: "", etag: "" }
  let file = ["html", "js", "png"][loop.count]
  loop.count++;
  rap.rest({
    url: `http://localhost:4005/index.${file}`,
    method: "post",
    data: { data: "xxx" + (loop.count - 1) },
    headers: { "if-modified-single": loop.modify || "", "if-None-Match": loop.etag || "" },
    success: function(ret, res) {
      callback(res,loop);

      if(loop.count==1){
        loop.etag = res.headers["etag"];
        loop.modify = ""
      }else{
        loop.etag =""
        loop.modify = res.headers["last-modified"]
      }

      if (loop.count >= time) {
        done();
      } else {
        restCache(callback, time, loop)
      }
    },
    error(e) {
      expect(e).toBe(1)
      done();
    }

  });
}

function TestCache(res,loop){
  if(loop.count==1){
    expect(res.statusCode).toBe(200)
  }else{
    expect(res.statusCode).toBe(304)
  }

  expect(res.headers["etag"]).not.toBeUndefined()
  expect(res.headers["last-modified"]).not.toBeUndefined()
}

restCache(TestCache, 3);

},10000)
