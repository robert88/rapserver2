const toPath = localRequire("@/server/lib/node_modules/enhanced-resolve/lib/toPath.js")

class Action {
  constructor(system, actionPath) {
    this.system = system;
    this.map = {};
    this.unique = {} //防止死循环
    this.actionPath = toPath(actionPath)
    this.init()
  }

  // action映射
  actionToAction(actionName) {

    //如果已经映射了就不需要深层映射
    if (this.unique[actionName]) {
      //返回原值
      return this.map[actionName];
    }

    this.unique[actionName] = true;

    //如果存在闭合映射，那么最终的映射一定是指向最后一个地方，第一个会等于自己
    if (typeof this.map[actionName] == "string") {

      //得到的值也是不区分大小写
      let maybeActionName = this.map[actionName].toLowerCase();

      //如果存在深层映射，
      if (this.map[maybeActionName] && maybeActionName != actionName) {
        //赋值的作用：如果是循环那么最终都会指向一个地方
        return this.map[maybeActionName] = this.actionToAction(maybeActionName)
      }
    }
    //返回原值
    return this.map[actionName];
  }

  //解析js
  parseAction(file) {
    let fileAction = require(file);

    let filePath = toPath(file).replace(this.actionPath, "").replace(".js", "").toLowerCase();

    if (typeof fileAction == "object") {

      //得到完整的action
      for (var key in fileAction) {

        let actionName = key.toLowerCase();

        //不以“/”开头就得合并文件名作为action的一部分；“/”开头的action不会拼接文件路径
        if (!key.indexOf("/") == 0) {
          actionName = (filePath + "/" + key).toLowerCase();
        }

        this.map[actionName] = fileAction[key];

      }
      //独立一个action，对应的路径就是跟路径了
    } else {
      //不区分大小写
      let actionName = filePath;

      this.map[actionName] = fileAction;
    }
  }

  //匹配一个action
  getAction(actionName, request, response, callback) {
    var actionValue = this.map[actionName.toLowerCase()];
    if (!actionValue) {
      callback({ type: "file", value: actionName });
    } else {
      //如果是字符串，因为之前已经映射过了，这里就不需要再次映射
      if (typeof actionValue == "string") {
        actionValue = actionValue.replace(/^\s+|\s+$/,"");
        let isNotUrl = (!/[-A-Za-z0-9+&@#\/%?=~_|!:,\.;]+[-A-Za-z0-9+&@#/%=~_|]/.test(actionValue))
        if ( isNotUrl) {
          callback({ type: "data", value: ret });
        }else{
          callback({ type: "file", value: actionValue });
        }
      } else if (typeof actionValue == "function") {
        actionValue(request, response, (ret, type) => {
          //动态映射
          if (typeof ret == "string") {
            let isNotUrl = (!/[-A-Za-z0-9+&@#\/%?=~_|!:,\.;]+[-A-Za-z0-9+&@#/%=~_|]/.test(actionValue))
            if (type == "text/text" || isNotUrl) {
              callback({ type: "data", value: ret });
            }else{
              //防止死循环
              request.rap.actionMapUnique = request.rap.actionMapUnique || {};
              if(request.rap.actionMapUnique[actionName]){
                callback({ type: "file", value: ret });
              }else{
                request.rap.actionMapUnique[actionName] = 1;
                this.getAction(ret, request, response, callback); 
              }
              
            }
          } else {
            callback({ type: "data", value: ret });
          }
        });
      }
    }
  }
  //初始化
  init() {

    let files = this.system.input.findFileSync(this.actionPath, "js", true);

    files.forEach((file) => {
      this.parseAction(file);
    });

    //提前处理action之间的映射，那么对应字符串的映射就不存在了
    for (let key in this.map) {
      this.map[key] = this.actionToAction(key);
    }

  }

}



module.exports = function(run, actionPath) {
  if (!actionPath) {
    return;
  }
  var action = new Action(rap.system, actionPath);

  run.inPipe.tapAsync({
    name: "action",
    fn(request, response, next) {
      if (request.rap.action) {
        next();
      } else {

        let mapUrl = request.rap.url.toLowerCase();

        action.getAction(mapUrl, request, response, mapInfo => {
          //得到是一个文件
          if (mapInfo.type == "file") {
            request.rap.url = mapInfo.value;
            //得到是一个数据
          } else if (mapInfo.type == "data") {
            request.rap.action = mapInfo.value;
          }
          next();
        });

      }
    }
  });

  run.outPipe.tapAsync({
    name: "action",
    fn(request, response, next) {
      if (request.rap.action) {
        let ret = request.rap.action;
        if (typeof ret == "string") {
          response.setHeader("Content-Type", ["text/plain"])
        } else if (!Buffer.isBuffer(ret) && typeof ret == "object") {
          response.setHeader("Content-Type", ["application/json"])
          ret = JSON.stringify(ret)
        }
        response.writeHead(200);
        response.end(ret);
      } else {
        next();
      }
    }
  })

  //如果没有走静态页的化就走这里
  run.outPipe.tapAsync({
    name: "actionEnd",
    fn(request, response, next) {
      if(!response.finished){
        throw new Error("not find file or action:"+request.rap.url);
      }
    }
  })
}