//测试
require("../lib/global/global.localRequire");
localRequire("@/server/lib/rap/rap.js");

const Runner = localRequire("@/server/bootstrap/Runner.js");
let run4008 = new Runner({ port: 4008 });

localRequire("@/server/pipe/common.js")(run4008);
localRequire("@/server/pipe/cookie.js")(run4008);
localRequire("@/server/pipe/session.js")(run4008);

let req = 0;
let se;
let se2;
let se3;
run4008.inPipe.tapAsync({
  name: "sessionTest",
  fn(request, response, next) {
    if (req == 0) {

      response.rap.session.set("login", true, () => {
        response.rap.session.set("username", "robert", () => {
          response.rap.session.set("password", "pw", () => {
            next();
          })
        })
      })
    } else if(req == 1) {
      se = response.rap.session.get("login");
      response.rap.session.del("username", () => {
        se2 = response.rap.session.get("username")
        se3 = response.rap.session.get("password");
        next();
      })
    }else{
      response.rap.session.reset( () => {
        se = response.rap.session.get("login");
        se2 = response.rap.session.get("username")
        se3 = response.rap.session.get("password");
        next();
      })
    }
    req++;
  }
})

// //错误信息会被启动的服务捕获
test("test http server 4008 cookie rapid", function(done) {
  var i = 0;

  function restGet(file, RAPID, callback) {
    i++;
    var cookie = RAPID ? RAPID : ""
    rap.rest({
      url: "http://localhost:4008/" + file,
      method: "get",
      headers: { Cookie: cookie },
      success(ret, res) {
        var rapid = res.headers["set-cookie"][0].split(";")[0];
        callback(ret, res);
        if (i <=2) {
          restGet(file, rapid, callback);
        }

      },
      error(err) {
        expect("rest error").toBe(1)
        done();
      }
    })
  }

  restGet("index.png", null, (ret, res) => {
    if (req == 1){
      expect(se).toBeUndefined()
      expect(se2).toBeUndefined()
      expect(se3).toBeUndefined()
    }else if (req == 2){
      expect(se).toBe(true)
      expect(se2).toBeNull()
      expect(se3).toBe("pw")
    }else{
      expect(se).toBeNull()
      expect(se2).toBeNull()
      expect(se3).toBeNull()
      done();
    }

  })

}, 10000)