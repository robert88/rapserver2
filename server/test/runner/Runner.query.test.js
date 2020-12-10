//测试
require("../lib/global/global.localRequire");
localRequire("@/server/lib/rap/rap.js");

const Runner = localRequire("@/server/bootstrap/Runner.js");
let run4004 = new Runner({ port: 4004 });

localRequire("@/server/pipe/common.js")(run4004);
localRequire("@/server/pipe/query.js")(run4004);

let req;
run4004.inPipe.tapAsync({
  name: "querytest",
  fn(request, response, next) {
    req = response.rap;
    next();
  }
})

//错误信息会被启动的服务捕获
test("test http server 4004 get query", function(done) {

  /**
   * test get
   * 
   */
  function testGet(callback) {
    expect(req.url).toBe("/")
    expect(req.port).toBe(4004)
    expect(req.query.jsv).toBe("2.4.8")
    expect(req.query.a).toBe(true)
    expect(req.query.t).toEqual(["中国", "中国人"])
    callback();
  }

  function restGet(callback) {
    rap.rest({
      url: "http://localhost:4004/?jsv=2.4.8&a=true&appKey=12574478&t=%E4%B8%AD%E5%9B%BD&t=%E4%B8%AD%E5%9B%BD%E4%BA%BA",
      method: "get",
      success(ret) {
        callback(ret);
      },
      error(err) {
        expect("rest error").toBe(1)
        done();
      }
    })
  }

  /**
   * test post
   * 
   */
  function testPost(callback) {
    expect(req.url).toBe("/app/index.html")
    expect(req.port).toBe(4004)
    expect(req.query.jsv).toBe("2.4.9")
    expect(req.query.a).toBe("1") //会转为字符串
    expect(req.query.b).toBe("2")
    expect(req.query.t).toEqual(["中国", "中国人1"]);
    callback()
  }

  function restPost(callback) {
    rap.rest({
      url: "http://localhost:4004/app/index.html?jsv=2.4.9&a=false&appKey=12574478&t=%E4%B8%AD%E5%9B%BD&t=%E4%B8%AD%E5%9B%BD%E4%BA%BA1",
      method: "post",
      data: { a: 1, b: 2 },
      success: function(ret) {
        callback(ret);
      },
      error() {
        expect("rest error").toBe(1)
        done();
      }
    });
  }

  /*
   *test binary post
   */
  function testBinaryPost(loop) {
    expect(req.url).toBe("/")
    expect(req.port).toBe(4004)
    expect(req.query.jsv).toBe("2.4.8")
    expect(req.query.t).toEqual(["中国", "中国人"])
    //数据叠加
    var data = rap.system.input.readDataSync(req.query._serverTemplateFile);
    var expectData = "";
    for (let i = 0; i < loop.count; i++) {
      expectData += "data=xxx" + i;
    }
    expect(data).toBe(expectData)
    expect(req.query.response["x-binary-range"]).toBe("1-" + Buffer.from(data).byteLength);
  }

  function restBinaryPost(callback,time,loop) {
    loop = loop || { count: 0, range: "" }
    loop.count++;
    rap.rest({
      url: "http://localhost:4004/?jsv=2.4.8&a=true&appKey=12574478&t=%E4%B8%AD%E5%9B%BD&t=%E4%B8%AD%E5%9B%BD%E4%BA%BA",
      method: "post",
      data: { data: "xxx" + (loop.count-1) },
      headers: { "x-binary-data": true, "x-binary-range": loop.range },
      success: function(ret, res) {
        callback(loop);
        loop.range = res.headers["x-binary-range"]
        if (loop.count >= time) {
          done();
        } else {
          restBinaryPost(callback,time,loop)
        }
      },
      error(e) {
        expect("rest error").toBe(1)
        done();
      }

    });
  }

  //测试入口
  run4004.ready(() => {
    restGet(() => {
      testGet(() => {
        restPost(() => {
          testPost(() => {
            restBinaryPost((loop) => {
              testBinaryPost(loop);
            },3)
          })
        })
      });
    })
  })

}, 1000000)