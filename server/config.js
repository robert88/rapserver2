// /*
//  *
//  * @title：rap框架
//  * 用于构建通用的web程序
//  * @author：尹明
//  * */
// require("./lib/global/global.localRequire");
// localRequire("@/server/lib/rap.js");
// // const portfinder = require("portfinder")

// module.exports = function(callback) {
//   // portfinder.getPortPromise().then(port=>{
//   //     callback({
//   //         staticMap:{rapserver:localRequire("@/server/static",true)},
//   //         port:port
//   //     })
//   // });
//   rap.getPort(port => {
//     callback({
//       staticMap: { rapserver: localRequire("@/server/static", true) },
//       port: port
//     })
//   })
// }

var buffer = Buffer.from([0x3, 0x4, 0x23, 0x42,0x24, 0x45,0x26, 0x47]);

var a = buffer.readUInt32BE(2) 
console.log(a.toString(16))
buffer.writeUInt32BE(0x32244254, 2)
a = buffer.readUInt32BE(2) 
console.log(a.toString(16))
