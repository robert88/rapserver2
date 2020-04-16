//测试
require("../lib/global/global.localRequire");
localRequire("@/server/lib/rap/rap.js");

const Runner = localRequire("@/server/bootstrap/Runner.js");
let run4006 = new Runner({ port: 4006 });

localRequire("@/server/pipe/common.js")(run4006);
localRequire("@/server/pipe/query.js")(run4006);
localRequire("@/server/pipe/cookie.js")(run4006);
let setIdMap = { setFileId: localRequire("@/server/test/testStaticFileSetId", true),rapserver: localRequire("@/server/test/testStaticFile", true)  }
localRequire("@/server/pipe/staticFile.setId.js")(run4006,setIdMap );

localRequire("@/server/pipe/staticFile.js")(run4006, setIdMap);



rap.system.output.writeSync(setIdMap.rapserver+"/index.html", "hello world1!");
rap.system.output.writeSync(setIdMap.rapserver+"/index.js", "hello world2!");
rap.system.output.writeSync(setIdMap.rapserver+"/index.png", "hello world3!");

rap.system.output.writeSync(setIdMap.setFileId+"/index.html", "hello world4!");
rap.system.output.writeSync(setIdMap.setFileId+"/index.js", "hello world5!");
rap.system.output.writeSync(setIdMap.setFileId+"/index.png", "hello world6!");

// //错误信息会被启动的服务捕获
test("test http server 4006 get static file", function(done) {

  function restGet(file,callback) {
    rap.rest({
      url: "http://localhost:4006/"+file,
      method: "get",
      success(ret,res) {
        callback(ret,res);
      },
      headers:{"accept-encoding":"gzip"},
      error(err) {
        expect("rest error").toBe(1)
        done();
      }
    })
  }

  restGet("index.html",ret=>{
    expect(ret).toBe("hello world1!")
    restGet("index.js",(ret,res)=>{
      expect(~res.headers["content-encoding"].indexOf("gzip")).toBe(-1)
      expect(ret).toBe("hello world2!");
      restGet("index.png",(ret,res)=>{
        expect(res.headers["content-encoding"]).toBeUndefined()
        expect(ret).toBe("hello world3!")
        done()
      })
    })
  })

},10000)

//请求专项地址
test("test http server 4006 get rootid file", function(done) {

  function restGet(file,callback) {
    rap.rest({
      url: "http://localhost:4006/"+file,
      method: "get",
      success(ret,res) {
        callback(ret,res);
      },
      headers:{"cookie":"serverRootId=setFileId;"},
      error(err) {
        expect("rest error").toBe(1)
        done();
      }
    })
  }

  restGet("index.html",ret=>{
    expect(ret).toBe("hello world4!")
    restGet("index.js?serverRootId=rapserver",(ret,res)=>{
      expect(ret).toBe("hello world2!");
      restGet("index.png",(ret,res)=>{
        expect(res.headers["content-encoding"]).toBeUndefined()
        expect(ret).toBe("hello world6!")
        done()
      })
    })
  })

},10000)