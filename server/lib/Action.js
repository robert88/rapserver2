require("./global/global.localRequire.js")
const toPath = localRequire("@/server/lib/node_modules/enhanced-resolve/lib/toPath.js");

localRequire("@/server/lib/global/global.js");

localRequire("@/server/lib/rap/rap.js");


const {
  ActionMap,
  getActionMap,
  setActionMap
} = localRequire("@/server/lib/ActionMap.js");

class Action {
  constructor(actionMap) {
    this.map = {};
    this.init(actionMap)
  }
  //初始化
  init(actionMap) {

    //可以提供多个action路径
    for (var uuid in actionMap) {
      let actionPath = toPath(actionMap[uuid]);
      this.map[uuid] = new ActionMap();
      let files = rap.system.input.findFileSync(actionPath, "js", true);
      files.forEach((file) => {
        this.parseAction(file, actionPath, uuid);
      });

    }

    //提前处理action之间的映射，那么对应字符串的映射就不存在了
    this.actionToAction(this.map);

  }
  // action映射
  actionToAction(map) {
    for (var key in map) {
      var val = map[key];
      if (val.child) {
        this.actionToAction(val.child);
      }

      //判断是否地址映射,必须是/开头
      if (typeof val.value == "string" && /^\s*\//.test(val.value)) {
        let oldValue = val.value;
        val.value = "__loop__";//防止死循环
        let newValue = this.loopFindAction(val.value.trim());
        if (findAction == null && findAction !== "__loop__") {
          val.value = oldValue;
        } else {
          val.value = newValue;
        }
      }
    }
  }

  //查找action
  loopFindAction(filePath) {

    var toAction = getActionMap(this.map, filePath);

    if (typeof toAction == "string" && toAction.slice(0, 1) == "/") {
      return this.loopFindAction(toAction);
    }
    return toAction;
  }

  //解析js
  parseAction(file, actionPath, uuid, update) {

    //清除一下缓存
    clearLocalRequireCache(file);

    let actionValue = require(file);

    let filePath = toPath(file).replace(actionPath, "").replace(".js", "").toLowerCase(); //相对路径

    if (Object.prototype.toString.call(actionValue) == "[object Object]") {
      for (var key in actionValue) {
        if (key.indexOf("/") == 0) {
          setActionMap(this.map[uuid], key, actionValue[key]);
        } else {
          setActionMap(this.map[uuid], filePath + "/" + key, actionValue[key]);
        }
      }
    } else {
      setActionMap(this.map[uuid], filePath, actionValue);
    }

  }
  //更新
  update(file, actionPath, uuid) {
    this.parseAction(file, actionPath, uuid, true);
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
              if (info.type == "file" && !actionMapUnique[actionName] && info.value != actionName) { //动态得到新的url需要判断一下是否有action信息
                actionMapUnique[actionName] = 1;
                that.run(runner, request, response, callback, actionMapUnique);
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

/**
 * string
 */

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


new Action({rapsever:localRequire("@/server/action", true)})