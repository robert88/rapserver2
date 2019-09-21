function createLoginWrap(action,stringFlag) {
  let loginFunc;
  if (typeof action == "function") {
    //当前的actionNext是action的next不是request的next
    loginFunc =  function(request, response, actionNext) {
 
      if (request.rap.session.get("global_accent_login")) {
        action.call(null,request, response, actionNext);
      } else {
        actionNext("/__accent_login__");
      }
    }
  } else {
    loginFunc =  function(request, response, actionNext) {
      if (request.rap.session.get("global_accent_login")) {
        actionNext(action);
      } else {
        actionNext("/__accent_login__");
      }
    }
  }
  if(stringFlag){
    return new Function(["request", "response", "actionNext"],loginFunc.toString().replace(/^\s*function\s*\(\s*request\s*,\s*response\s*,\s*actionNext\s*\)\s*\{/m,"").replace(/\}\s*$/m,"").replace("action","("+action.toString()+")"))
  }else{
    return loginFunc;
  }
}

//拦截路径
var loginInterceptPathMap =

  //通过login函数包裹起来
  module.exports = {
    //action包裹
    wrap(actionFile,stringFlag) {
      if (typeof actionFile == "object") {
        for (let key in actionFile) {
          actionFile[key] = createLoginWrap(actionFile[key],stringFlag);
        }
      } else {
        return createLoginWrap(actionFile,stringFlag);
      }
    },
    setloginStatus(request, flag, next) {
      request.rap.session.set("global_accent_login", flag, next)
    },
    //添加
    addPath(path) {
      this.path.add(path.replace(/\\$/, "").replace(/\/$/, ""));
    },
    path: new Set()
  }