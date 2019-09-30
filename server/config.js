/*
*
* @title：rap框架
* 用于构建通用的web程序
* @author：尹明
* */
require("./lib/global/global.localRequire");
const portfinder = require("portfinder")



module.exports = function(callback){
    portfinder.getPortPromise().then(port=>{
        callback({
            staticMap:{rapserver:localRequire("@/server/static",true)},
            port:port
        })
    });
}


