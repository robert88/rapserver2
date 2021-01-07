require("./global/global.localRequire.js")
const toPath = localRequire("@/server/lib/node_modules/enhanced-resolve/lib/toPath.js");

localRequire("@/server/lib/global/global.js");

localRequire("@/server/lib/rap/rap.js");

const {getDefaultFile} = localRequire("@/server/lib/resolveFile.js")

const {
  ActionMap,
  getActionMap,
  setActionMap
} = localRequire("@/server/lib/ActionMap.js");

class Action {
  constructor(actionMap) {
    this.init(actionMap)
  }
  //初始化,或者重新设置
  init(actionMap) {
    this.map = new ActionMap("", {});
    //可以提供多个action路径
    for (var uuid in actionMap) {
      let actionPath = toPath(actionMap[uuid]);
      let id = uuid.toLowerCase();
      this.map.child[id] = new ActionMap();
      let files = rap.system.input.findFileSync(actionPath, "js", true);
      files.forEach((file) => {
        this.parseAction(file, actionPath, id);
      });

    }

    //提前处理action之间的映射，那么对应字符串的映射就不存在了
    this.actionToAction(this.map);

  }
  // action映射
  actionToAction(map) {

    if (map.child) {
      for (var key in map.child) {
        this.actionToAction(map.child[key]);
      }
    }

    //判断是否地址映射,必须是/开头
    if (typeof map.value == "string" && /^\s*\//.test(map.value)) {
      let oldValue = map.value;
      map.value = "__loop__"; //防止死循环
      let newValue = this.loopFindAction(oldValue.trim());
      if (newValue == null || newValue == "__loop__") {
        map.value = oldValue;
      } else {
        map.value = newValue;
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
  parseAction(file, actionPath, uuid) {

    //清除一下缓存
    clearLocalRequireCache(file);

    let actionValue = require(file);

    let filePath = toPath(file).replace(actionPath, "").replace(".js", "").toLowerCase(); //相对路径

    if (Object.prototype.toString.call(actionValue) == "[object Object]") {
      for (var key in actionValue) {
        if (key.indexOf("/") == 0) {
          setActionMap(this.map, key.toLowerCase(), actionValue[key]);
        } else {
          setActionMap(this.map.child[uuid], (filePath + "/" + key).toLowerCase(), actionValue[key]);
        }
      }
    } else {
      setActionMap(this.map.child[uuid], filePath, actionValue);
    }

  }
  //局部更新,文件key没有变的情况下可以使用
  update(file, actionPath, uuid) {
      let id = uuid.toLowerCase();
    this.parseAction(file, actionPath, id);

    //提前处理action之间的映射，那么对应字符串的映射就不存在了
    this.actionToAction(this.map);
  }

  /**
   *   //匹配一个action
   * @param {*} request  
   * @param {*} response 
   * @param {*} runner 服务器实例，方便action里面可以控制
   * @param actionMapUnique//防止死循环//已经匹配过了
   * @param {*} callback 
   */
  run(runner,request, response, callback,actionMapUnique) {
    var that = this;
    var actionName = response.rap.url.toLowerCase();
    var actionValue = getActionMap(runner.action.map,actionName,(queryValue,queryName)=>{
        response.rap.query[queryName] = queryValue;
    });

    if (!actionValue) {
      callback({ type: "file", value: response.rap.url });
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
              if (info.type == "file" && !actionMapUnique[actionName] && info.value.toLowerCase() != actionName) { //动态得到新的url需要判断一下是否有action信息
                actionMapUnique[actionName] = 1;
                response.rap.url = getDefaultFile(info.value);
                that.run(runner, request, response, callback, actionMapUnique);
              } else {
                actionMapUnique = null;
                callback(info);
              }
            });

          } else {
            actionMapUnique = null;
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

function handlerTypeString(type, actionValue, callback) {
  actionValue = actionValue.trim();
  let isNotUrl = actionValue.indexOf("/") == -1 || /\s/.test(actionValue) || actionValue.length > 2083; //ie最大url长度
  let isRemote = (/^https?:\/\//.test(actionValue))
  if (isNotUrl|| type=="text/text") {
    callback({ type: "data", value: actionValue });
  } else if (isRemote) {
    callback({ type: "remote", value: actionValue });
  } else {
    callback({ type: "file", value: actionValue });
  }
}


module.exports = Action;


// var action = new Action({ rapserver: localRequire("@/server/action", true) })

// action.update(localRequire("@/server/action/sockie.js", true), localRequire("@/server/action", true), "rapserver");

// console.log(action)

// action.run({action:action,config:{},sockie:{}}, {}, {rap:{url:"/RAPSERVER/sockie/1021/test",query:{}}}, function(){console.log("end")})