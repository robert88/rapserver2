//测试
require("../lib/global/global.localRequire");
localRequire("@/server/lib/rap/rap.js");

const Runner = localRequire("@/server/bootstrap/Runner.js");
const loginIntercept = localRequire("@/server/intercept/login.js");
let run4010 = new Runner({ port: 4010 });

var action ={
  "/login":function(req,res,next){
    //登陆成功了
    loginIntercept.setloginStatus(req,true,()=>{
      next("登陆成功","text/text");
    });
      //调到action
  },
    //得到/index/refresh1，并且超时
    "/unlogin":function(req,res,next){
      //登陆成功了
      loginIntercept.setloginStatus(req,false,()=>{
        next("退出登陆","text/text");
      });
        //调到action
    },
    "/login/path":function(req,res,next){
      // 需要登陆
      next("通过登陆校验","text/text");
    },
  "/checkLogin":loginIntercept.wrap(function(req,res,next){
    // 需要登陆
    next("已登陆","text/text");
},true)
}

var actionString = ['const loginIntercept = localRequire("@/server/intercept/login.js");exports=module.exports={'];
for(let key in action){
  if(typeof action[key]=="function"){
    actionString.push('"'+key+'"'+":"+action[key].toString()+",")
  }else{
    actionString.push('"'+key+'"'+":"+'"'+action[key]+'"'+",")
  }
}
actionString.push("}");
actionString = actionString.join("")

rap.system.output.writeSync(localRequire("@/server/test/testLogin/index.js",true),actionString);

localRequire("@/server/pipe/common.js")(run4010);
localRequire("@/server/pipe/cookie.js")(run4010);
localRequire("@/server/pipe/session.js")(run4010);
localRequire("@/server/pipe/login.js")(run4010);
localRequire("@/server/pipe/action.js")(run4010,localRequire("@/server/test/testLogin",true));


//这个路径需要登陆权限
loginIntercept.addPath("/login/path");

var sessionId 
function restGet(action,callback,error) {
  var cookie = sessionId ? sessionId : "";
  return new Promise((resolve,reject)=>{
    rap.rest({
      url: "http://localhost:4010" + action,
      method: "get",
      headers: { Cookie: cookie },
      success(ret, res) {
        var resSession = res.headers["set-cookie"][0].split(";")[0];
        if(resSession){
          sessionId = resSession;
        }
        resolve(ret);
      },
      error(err) {
        reject(err);
      }
    })
  })
}


//登陆校验
test("test http server 4010 login", function(done) {


  restGet("/login").then(ret=>{
    expect(ret).toBe("登陆成功");
    return restGet("/checkLogin")
  }).then(ret=>{
    expect(ret).toBe("已登陆");
    return restGet("/login/path")
  }).then(ret=>{
    expect(ret).toBe("通过登陆校验");
    return restGet("/unLogin")
  }).catch(err=>{
    expect(err).toBe(-1);
    done();
 }).then(ret=>{
    expect(ret).toBe("退出登陆");
    return restGet("/checkLogin")
  }).then(ret=>{
    expect("已经退出了怎么还进成功页面").toBe(-1);
    done();
  }).catch(err=>{
     //退出登陆了，会跳默认的登陆页面
    expect(err.indexOf("not find file or action:/__accent_login__")).not.toBe(-1);
    return restGet("/login/path")
  }).then(ret=>{
    expect("已经退出了怎么还进成功页面").toBe(-1);
    done();
  }).catch(err=>{
     //退出登陆了，会跳默认的登陆页面
    expect(err.indexOf("not find file or action:/__accent_login__")).not.toBe(-1);
    done();
  })
 

}, 100000)


