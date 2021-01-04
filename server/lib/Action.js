const toPath = localRequire("@/server/lib/node_modules/enhanced-resolve/lib/toPath.js");


class Action {
  constructor(system, actionMap) {
    this.system = system;
    this.map = {};
    this.unique = {} //防止死循环
    this.actionMap = actionMap
    this.init()
  }
  //初始化
  init() {

    //可以提供多个action路径
    for (var uuid in this.actionMap) {
      let actionPath = toPath(this.actionMap[uuid])
      let files = this.system.input.findFileSync(actionPath, "js", true);
      files.forEach((file) => {
        this.parseAction(file, actionPath, uuid);
      });

    }

    //提前处理action之间的映射，那么对应字符串的映射就不存在了
    for (let key in this.map) {
      this.map[key] = this.actionToAction(key);
    }

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
  parseAction(file, actionPath, uuid, update) {

    //清除一下缓存
    clearLocalRequireCache(file);

    let fileAction = require(file);

    let filePath = toPath(file).replace(actionPath, "").replace(".js", "").toLowerCase();

    if (typeof fileAction == "object") {

      //得到完整的action
      for (var key in fileAction) {

        let actionName = key.toLowerCase();

        //不以“/”开头就得合并文件名作为action的一部分；“/”开头的action不会拼接文件路径
        if (!key.indexOf("/") == 0) {
          actionName = ("/" + uuid + "/" + filePath + "/" + key).toLowerCase().toURI();
        }
        //友好的提示
        if (this.map[actionName] && !update) {
          rap.console.log(actionName, "重复定义了")
        }
        this.map[actionName] = fileAction[key];

      }
      //独立一个action，对应的路径就是跟路径了
    } else {
      //不区分大小写
      let actionName = filePath;
      //友好的提示
      if (this.map[actionName] && !update) {
        rap.console.log(actionName, "重复定义了")
      }
      this.map[actionName] = fileAction;
    }
  }

  update(file) {
    for (var uuid in this.actionMap) {
      let actionPath = toPath(this.actionMap[uuid])
      //存在
      if (file.indexOf(actionPath) == 0) {
        this.parseAction(file, actionPath, uuid, true);
        break;
      }
    }
  }

  /**
   *   //匹配一个action
   * @param {*} request  
   * @param {*} response 
   * @param {*} runner 服务器实例，方便action里面可以控制
   * @param actionMapUnique//防止死循环//已经匹配过了
   * @param {*} callback 
   */
  run(request, response, runner, callback, actionMapUnique) {
    var that = this;
    var actionName = response.rap.url.toLowerCase();
    var actionValue = this.map[actionName.toLowerCase()];

    if (!actionValue) {
      callback({ type: "file", value: actionName });
    } else {
      //如果是字符串，因为之前已经映射过了，这里就不需要再次映射
      if (typeof actionValue == "string") {
        handlerTypeString(null, actionValue, callback);
      } else if (typeof actionValue == "function") {
        //每个action都会触发
        actionValue.call(runner, request, response, (ret, type) => {
          //动态映射
          if (typeof ret == "string") {
            actionMapUnique = actionMapUnique || {};
            handlerTypeString(type, ret, function(info) {
              if (info.type == "file" && !actionMapUnique[actionName] && info.value != actionName) {//动态得到新的url需要判断一下是否有action信息
                actionMapUnique[actionName] = 1;
                that.run( runner, request, response, callback, actionMapUnique);
              } else {
                callback(info);
              }
            });

          } else {
            callback({ type: "data", value: ret });
          }
        });
      }
    }
  }


}


function handlerTypeString(type, ret, callback) {
  actionValue = actionValue.trim();
  let isNotUrl = actionValue.indexOf("/") == -1 || /\s/.test(actionValue) || actionValue.length > 2083; //ie最大url长度
  let isRemote = (/^https?:\/\//.test(actionValue))
  if (isNotUrl) {
    callback({ type: "data", value: ret });
  } else if (isRemote) {
    callback({ type: "remote", value: actionValue });
  } else {
    callback({ type: "file", value: actionValue });
  }
}
module.exports = Action;