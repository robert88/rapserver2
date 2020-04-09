// /*
//  *
//  * @title：rap框架
//  * 用于构建通用的web程序
//  * @author：尹明
//  * */

module.exports = function(callback) {
  if(ENV=="product"){
    callback({
      staticMap: { rapserver: localRequire("@/server/static", true) },
      port: 80
    })
  }else{
    rap.getPort(port => {
      callback({
        staticMap: { rapserver: localRequire("@/server/static", true) },
        port: port
      })
    })
  }

}

