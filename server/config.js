// /*
//  *
//  * @title：rap框架
//  * 用于构建通用的web程序
//  * @author：尹明
//  * */
const fs = require("fs");
module.exports = function(callback) {
  if(ENV=="product"){
    callback({
      staticMap: { rapserver: localRequire("@/server/static", true) },
      https:{
          key:fs.readFileSync( localRequire("@/server/exe/ssl/localhost.key",true) ),
          cert:fs.readFileSync( localRequire("@/server/exe/ssl/localhost.crt",true) )
      }
    })
  }else{
    rap.getPort(port => {
      callback({
        staticMap: { rapserver: localRequire("@/server/static", true) },
        port: port,
        https:{
          key:fs.readFileSync( localRequire("@/server/exe/ssl/localhost.key",true) ),
          cert:fs.readFileSync( localRequire("@/server/exe/ssl/localhost.crt",true) )
      }
      })
    })
  }

}

