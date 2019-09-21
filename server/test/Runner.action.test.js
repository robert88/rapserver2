//测试
require("../lib/global/global.localRequire");
localRequire("@/server/lib/rap/rap.js");

const Runner = localRequire("@/server/bootstrap/Runner.js");
let run4009 = new Runner({ port: 4009 });

var action ={
  //得到/index/refresh1，并且超时
  "refresh1":function(req,res,next){
      //调到action
  },
  //得到/index/refresh3 并且映射到"/routerA"
  "refresh3":"/routerA",
  //得到根/refresh4  异步处理返回
  "/refresh4":function(req,res,next){
      //异步
     setTimeout(function () {
         next("text","text/text")
     },100)
  },
  //得到/refresh5 ,同步next返回
  "/refresh5":function(req,res,next){
      //同步
      next("textrefresh5","text/text")
  },
  //得到/refresh6 同步直接返回
  "/refresh6":function(req,res,next){
      //同步
      next({code:200,message:"text"})
  },
  //映射到/index/refresh3,最终得到"/routerB",
  "/refresh8":"/index/refresh3",
  //死循环映射，最终得到自己
  "/routerA":"/routerB",
  "/routerB":"/routerA"
}

var actionString = ["exports=module.exports={"];
for(let key in action){
  if(typeof action[key]=="function"){
    actionString.push('"'+key+'"'+":"+action[key].toString()+",")
  }else{
    actionString.push('"'+key+'"'+":"+'"'+action[key]+'"'+",")
  }
}
actionString.push("}");
actionString = actionString.join("")

rap.system.output.writeSync(localRequire("@/server/test/testAction/index.js",true),actionString);

localRequire("@/server/pipe/common.js")(run4009);
localRequire("@/server/pipe/action.js")(run4009,localRequire("@/server/test/testAction",true));

function restGet(action,callback,error) {

  rap.rest({
    url: "http://localhost:4009" + action,
    method: "get",
    success(ret, res) {
      if(callback){
        callback(ret);
      }
    },
    error(err) {
      if(error){
        error(err);
      }
    }
  })
}


// //错误信息会被启动的服务捕获
test("test http server 4009 action rapid", function(done) {




//解决不了jest和异步throw的错误,超时时间必须比done要晚

restGet("/index/refresh1",ret=>{
  console.error("超时错误")
 },err=>{
   if(err.indexOf("request timeout")!=-1){
     console.log("超时测试ok")
   }else{
     console.log("超时错误")
   }
 });
 


  restGet("/routerA",ret=>{
    expect("not run").toBe(-1);
  },err=>{
    expect(err.indexOf("not find file or action:/routerB")).not.toBe(-1);
  });

  restGet("/routerB",ret=>{
    expect("not run").toBe(-1);
  },err=>{
    expect(err.indexOf("not find file or action:/routerB")).not.toBe(-1);
  });

  restGet("/index/refresh3",ret=>{
    expect("not run").toBe(-1);
  },err=>{
    expect(err.indexOf("not find file or action:/routerB")).not.toBe(-1);
  });

  restGet("/refresh8",ret=>{
    expect("not run").toBe(-1);
  },err=>{
    expect(err.indexOf("not find file or action:/routerB")).not.toBe(-1);
  });

  restGet("/refresh4",ret=>{
    expect(ret).toBe("text");
  },err=>{
    expect("not run").toBe(-1);
  });

  restGet("/refresh5",ret=>{
    expect(ret).toBe("textrefresh5");
  },err=>{
    expect("not run").toBe(-1);
  });

  restGet("/refresh6",ret=>{
    ret = JSON.parse(ret)
    expect(ret.code).toBe(200);
    expect(ret.message).toBe("text");
  },err=>{
    expect("not run").toBe(-1);
  });

  setTimeout(()=>{
    done();
  },5000)

}, 100000)