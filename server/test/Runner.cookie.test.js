//测试
require("../lib/global/global.localRequire");
localRequire("@/server/lib/rap/rap.js");

const Runner = localRequire("@/server/bootstrap/Runner.js");
let run4007 = new Runner({ port: 4007 });

localRequire("@/server/pipe/common.js")(run4007);
localRequire("@/server/pipe/cookie.js")(run4007);



// //错误信息会被启动的服务捕获
test("test http server 4007 cookie rapid", function(done) {

  function restGet(file,callback) {
    rap.rest({
      url: "http://localhost:4007/"+file,
      method: "get",
      success(ret,res) {
        callback(ret,res);
      },
      error(err) {
        expect("rest error").toBe(1)
        done();
      }
    })
  }

  restGet("index.png",(ret,res)=>{
    var RAPID = res.headers["set-cookie"][0];
    expect(RAPID.indexOf("HttpOnly;")!=-1).toBe(true)
    expect(RAPID.indexOf("RAPID=pc_window_chrome_70")!=-1).toBe(true)
    done();
  })

},10000)
