const toPath = localRequire("@/server/lib/node_modules/enhanced-resolve/lib/toPath.js")

module.exports = function(run) {
  if (!run.config.actionMap) {
    console.log("not set action");
    return;
  }

  run.action = new Action(rap.system, run.config.actionMap);

  run.inPipe.tapAsync({
    name: "action",
    fn(request, response, next) {
      if (response.rap.action) {
        next();
      } else {

        let mapUrl = response.rap.url.toLowerCase();


        run.action.getAction(mapUrl, request, response, run, mapInfo => {
          //得到是一个文件
          if (mapInfo.type == "file") {
            response.rap.url = mapInfo.value;
            //得到是一个数据
          } else if (mapInfo.type == "remote") {
            response.rap.redirect = mapInfo.value;
          } else if (mapInfo.type == "data") {
            response.rap.action = mapInfo.value;
          }
          next();
        }, {});

      }
    }
  });

  run.outPipe.tapAsync({
    name: "action",
    fn(request, response, next) {
      if (response.rap.action) {
        let ret = response.rap.action;
        if (typeof ret == "string") {
          response.setHeader("Content-Type", ["text/plain"])
        } else if (!Buffer.isBuffer(ret) && typeof ret == "object") {
          response.setHeader("Content-Type", ["application/json"])
          ret = JSON.stringify(ret)
        }
        response.writeHead(200);
        response.end(ret);
      } else if (response.rap.redirect) {
        response.setHeader("Location", response.rap.redirect)
        response.writeHead(301);
        response.end();
      } else {
        next();
      }
    }
  })

}



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
  parseAction(file, actionPath, uuid) {

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
        if (this.map[actionName]) {
          console.log(actionName, "重复定义了")
        }
        this.map[actionName] = fileAction[key];

      }
      //独立一个action，对应的路径就是跟路径了
    } else {
      //不区分大小写
      let actionName = filePath;
      //友好的提示
      if (this.map[actionName]) {
        console.log(actionName, "重复定义了")
      }
      this.map[actionName] = fileAction;
    }
  }


  /**
   *   //匹配一个action
   * @param {*} actionName 这个url
   * @param {*} request  
   * @param {*} response 
   * @param {*} run 服务器实例，方便action里面可以控制
   * @param {*} callback 
   */
  getAction(actionName, request, response, run, callback, actionMapUnique) {
    var that = this
    var actionValue = this.map[actionName.toLowerCase()];
    if (!actionValue) {
      callback({ type: "file", value: actionName });
    } else {
      //如果是字符串，因为之前已经映射过了，这里就不需要再次映射
      if (typeof actionValue == "string") {
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
      } else if (typeof actionValue == "function") {
        //每个action都会触发
        actionValue.call(run, request, response, (ret, type) => {
          //动态映射
          if (typeof ret == "string") {
            ret = ret.trim();
            let isNotUrl = ret.indexOf("/") == -1 || /\s/.test(ret) || ret.length > 2083; //ie最大url长度
            let isRemote = (/^https?:\/\//.test(ret))
            if (type == "text/text" || isNotUrl) {
              callback({ type: "data", value: ret });
            } else if (isRemote) {
              callback({ type: "remote", value: ret });
            } else {
              //防止死循环
              actionMapUnique = actionMapUnique || {};
              if (actionMapUnique[actionName]) { //已经匹配过了，且是一个url
                callback({ type: "file", value: ret });
              } else {
                actionMapUnique[actionName] = 1;
                that.getAction(ret, request, response, run, callback, actionMapUnique);
              }

            }
          } else {
            callback({ type: "data", value: ret });
          }
        });
      }
    }
  }


}