global.rap = global.rap || {};

require("../global/global.localRequire");

localRequire("@/server/lib/rap/rap.debounce.js");
localRequire("@/server/lib/rap/rap.system");
localRequire("@/server/lib/rap/rap.restful.js");
localRequire("@/server/lib/rap/rap.userAgent.js");
localRequire("@/server/lib/rap/rap.cookie.js");

/*cmd*/
const Cmd = localRequire("@/server/lib/rap/Cmd.js");
rap.cmd = new Cmd(rap.system);

/***log***/
const Log = localRequire("@/server/lib/rap/Log.js");
let logPath = localRequire("@/server/log", true);
let log = new Log({ system: rap.system, outpath: logPath });
rap.console = log.init(rap, function(type, fn) {
  rap[type] = fn;
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
rap.md5 = (str) =>{
  var md5 = crypto.createHash('md5');
  md5.update(str);
  return md5.digest('hex');
}

var secretkey="rapserverRobert";//唯一（公共）秘钥
  //AES对称加密
rap.AES = (str) =>{
  var cipher=crypto.createCipher('aes192', secretkey);//使用aes192加密
  var enc=cipher.update(str,"utf8","hex");//编码方式从utf-8转为hex;
  enc+=cipher.final('hex');//编码方式转为hex;
  return enc;
}
  //AES对称解密
rap.unAES = (str) =>{
  var decipher=crypto.createDecipher('aes192', secretkey);
  var dec=decipher.update(str,"hex", "utf8");
  dec+=decipher.final("utf8");
  return dec;
}

/**
 * 获取端口号
 */
function getPort(startPort,callback){
  if(typeof startPort=="function"){
      callback = startPort;
      startPort = 3000;
  }
  startPort = startPort||3000;
  rap.cmd.execApi(`netstat -aon | findstr "${startPort}"`).then((str)=>{
      if(str){
        if(startPort<65535){
          getPort(++startPort,callback)
        }else{
          console.error("没有可用的端口号来监听http");
        }
      }else{
          callback(startPort)
      }
  }).catch(e=>{
    //Command failed,表示没有查到信息,即端口号没有被占用
    if(~e.message.indexOf("Command failed:")&&e.code==1){
      callback(startPort);
    }else{
      console.error(e.stack)
    }

  })
}

rap.getPort = getPort;

