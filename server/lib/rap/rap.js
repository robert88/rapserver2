global.rap = global.rap || {};

require("../global/global.localRequire");

localRequire("@/server/lib/rap/rap.debounce.js");
localRequire("@/server/lib/rap/rap.system");
localRequire("@/server/lib/rap/rap.restful.js");
localRequire("@/server/lib/rap/rap.userAgent.js");
localRequire("@/server/lib/rap/rap.cookie.js");
localRequire("@/server/lib/rap/rap.watch.js");
localRequire("@/server/lib/rap/rap.tool.js");

/*cmd*/
const Cmd = localRequire("@/server/lib/rap/Cmd.js");
rap.cmd = new Cmd(rap.system);

/***log***/
const Log = localRequire("@/server/lib/rap/Log.js");
let logPath = localRequire("@/server/log", true);
console.log("local log file Path", logPath)
let log = new Log({ system: rap.system, outpath: logPath });

rap.console = {}

log.init(rap, function(type, fn) {
  rap.console[type] = fn;
});

/****Archiver */
const Archiver = localRequire("@/server/lib/rap/Archiver.js");
rap.rar = new Archiver(rap.system, rap.cmd);

//**加密 */
const crypto = require('crypto');
//不可逆
rap.sha1 = (str) => {
  var sha1 = crypto.createHash('sha1');
  sha1.update(str);
  return sha1.digest('hex');
}
//不可逆
rap.md5 = (str) => {
  var md5 = crypto.createHash('md5');
  md5.update(str);
  return md5.digest('hex');
}

// var iv = "rapserverRobert"; //唯一（公共）秘钥
const iv = "rapserverRobert1"; //length==16必须
const key = "rapserverRobert2"; 
//AES对称加密
rap.AES = (data) => {
  //唯一（公共）秘钥
  let decipher = crypto.createCipheriv('aes-128-cbc', key, iv);
  return decipher.update(data, 'binary', 'base64') + decipher.final('base64');
}

//AES对称解密
rap.unAES = (crypted) => {
  crypted = new Buffer(crypted, 'base64').toString('binary');
  let decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
  return decipher.update(crypted, 'binary', 'utf8') + decipher.final('utf8');
}

/**
 * 获取端口号
 */
function getPort(startPort, callback) {
  if (typeof startPort == "function") {
    callback = startPort;
    startPort = 3000;
  }
  startPort = startPort || 3000;
  rap.cmd.execApi(`netstat -aon | findstr "${startPort}"`).then((str) => {
    if (str) {
      if (startPort < 65535) {
        getPort(++startPort, callback)
      } else {
        console.error("没有可用的端口号来监听http");
      }
    } else {
      callback(startPort)
    }
  }).catch(e => {
    //Command failed,表示没有查到信息,即端口号没有被占用

    if (~(e.message||"").indexOf("Command failed:") && e.code == 1) {
      callback(startPort);
    } else {
      console.error(e.stack)
    }

  })
}

rap.getPort = getPort;