global.rap = global.rap || {};

const pt = require("path");
require("../global/global.localRequire");
localRequire("@/server/lib/global/extention.Date.js");
localRequire("@/server/lib/global/extention.String.Cmd.Color.js");

module.exports = class Log {

  constructor(options) {
    this.dir = options.outpath
    this.system = options.system;
    this.dateFormat = {
      message: "yy/MM/dd hh:mm:ss", //消息中的时间格式
      filename: "yyMMdd_hhmmss" //文件名的时间格式
    }
    this.maxSize = options.maxSize || (3 * 1024 * 1024); //单个文件最大值为3M
    this.maxNumber = options.maxNumber || 10;
    this.zipWorkTime = {
      timeout: [0, 8] //打包监听的时间段
    }
  }

  //格式化-将参数序列化
  static format(log, type, callerParams) {
    let localCallerName = ""
    try {
      throw new Error("here"); //获取位置
    } catch (error) {
      let stack = error.stack.split(/\n|\r/)[3] || "";
      stack.replace(/\(([^\)]*?)\)\s*$/, (m, m1) => {
        localCallerName = m1;
      });
    }
    let callerParamsStr = [];
    Array.prototype.forEach.call(callerParams, (arg) => {
      if (typeof arg == "object") {
        callerParamsStr.push(JSON.stringify(arg));
      } else {
        callerParamsStr.push(arg);
      }
    })
    callerParamsStr = callerParamsStr.join(",")

    //将参数解析出来
    let time = new Date().format(log.dateFormat.message)
    let ret = `[${type}][${time}][${localCallerName}]\n${callerParamsStr}`;
    // if (type == "error") {
      // console.log(`[${type}]`.error + `[${time}][${localCallerName}]\n${callerParamsStr}`);
    // }
    return ret;
  }

  //添加全局的log变量
  init(rap, iniCallback,type) {
    ["log", "warn", "error"].forEach((type) => {
      this.initActive(type);
      let uuid = "uuid-log-" + type;
      //箭头函数没有arguments
      let fn = (...argsVar)=> {
        let callback = argsVar[argsVar.length-1];
        if (typeof callback == "function") {
          argsVar = argsVar.slice(0,argsVar.length-1)
        }

        let message = Log.format(this, type, argsVar);
        let log = this;
        let hanlder = function(messageStack, uuid) {
          let logType = uuid.replace("uuid-log-", "");
          log.save(messageStack, logType, callback);
        }

        //10s不会写入log数据
        rap.debounce(hanlder, 10000, uuid, message);
      }
      iniCallback(type, fn);

    });
    return this;
  }

  /**

  *
  * */
  save(message, type, callback) {
    this.getActive(type, (err, filename) => {
      if (typeof message == "object" && message.join) {
        message = message.join("\n") + "\n";
      }
      this.system.output.write(filename, message, true).finally(() => {
        this.system.input.purge("all",filename)
        if (typeof callback == "function") {
          callback(filename);
        }
      });

    });
  }



  //得到正在使用的日志文件
  getActive(type, callback) {

    let file = this.dir + "/" + this[type].active;

    this.system.input.getSize(file, (err, size) => {
      if (err) {
        size = 0;
      }
      //分文件
      if (size > this.maxSize) {
        this[type].active = new Date().format(this.dateFormat.filename) + "." + type;
      }
      callback(null, this.dir + "/" + this[type].active);
    }, err => {

    })

  }
  //获取当前写文件名
  initActive(type) {
    //经过排序之后，按时间顺序从小到大排序,filesystem必须提供findFileSync
    var files = this.system.input.findFileSync(this.dir, type);
    this[type] = this[type] || {};
    if (!files || files.length == 0) {
      this[type].active = new Date().format(this.dateFormat.filename) + "." + type;
    } else {
      files = files.sort();
      this[type].active = pt.basename(files[files.length - 1]);
    }
  }

}