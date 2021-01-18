// /*
//  *
//  * @title：rap框架
//  * 用于构建通用的web程序
//  * @author：尹明
//  * */
const fs = require("fs");
module.exports = function(callback) {
  if (ENV == "product") {
    callback({
      page404:"/rapserver/error/404.html",
      staticList: [{ name:"rapserver",path:localRequire("@/server/static/dest", true) }],
      actionMap: { rapserver: localRequire("@/server/action", true) },
      https: {
        key: fs.readFileSync(localRequire("@/server/exe/ssl/localhost.key", true)),
        cert: fs.readFileSync(localRequire("@/server/exe/ssl/localhost.crt", true)),
        port: 443
      },
      http: {
        port: 80
      }
    })
  } else {
    rap.getPort(port1 => {
      rap.getPort(port1 + 1, port2 => {
        callback({
          page404:"/rapserver/error/404.html",
          staticList: [{ name:"rapserver",path:localRequire("@/server/static/dest", true) }],
          actionMap: { rapserver: localRequire("@/server/action", true) },
          https: {
            port: port1,
            key: fs.readFileSync(localRequire("@/server/exe/ssl/localhost.key", true)),
            cert: fs.readFileSync(localRequire("@/server/exe/ssl/localhost.crt", true))
          },
          http: {
            port: port2
          }
        })
      })
    })
  }

}