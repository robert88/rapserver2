//测试
require("../lib/global/global.localRequire");
const Sockie = localRequire("@/server/bootstrap/Sockie.js");
const net = require("net");
/**
 *
 * 解析头部
 */
function readHeaders (lines) {
  var headers = {};
 var i, match;
 for (i = 1; i < lines.length; i++) {
     if ((match = lines[i].match(/^([a-z-]+): (.+)$/i))) {
         headers[match[1].toLowerCase()] = match[2];
     }
 }
 return headers;
}

function generateMetaData(fin, opcode, masked, payload) {
  var len, meta, start, mask, i

  len = payload.length

  // Creates the buffer for meta-data 65535是16位的最大值
  meta = Buffer.alloc(2 + (len < 126 ? 0 : (len < 65536 ? 2 : 8)) + (masked ? 4 : 0))

  // Sets fin and opcode
  meta[0] = (fin ? 128 : 0) + opcode

  // Sets the mask and length
  meta[1] = masked ? 128 : 0
  start = 2
  if (len < 126) {
    meta[1] += len
  } else if (len < 65536) {
    meta[1] += 126
    meta.writeUInt16BE(len, 2)
    start += 2
  } else {
    // Warning: JS doesn't support integers greater than 2^53
    meta[1] += 127
    meta.writeUInt32BE(Math.floor(len >> 32), 2)
    meta.writeUInt32BE(len % Math.pow(2, 32), 6)
    start += 8
  }

  // Set the mask-key
  if (masked) {
    mask = Buffer.alloc(4)
    for (i = 0; i < 4; i++) {
      meta[start + i] = mask[i] = Math.floor(Math.random() * 256)
    }
    for (i = 0; i < payload.length; i++) {
      payload[i] ^= mask[i % 4]
    }
    start += 4
  }

  return meta
}

function sendMessage(toClient, payload,opcode){
  var fin = 1;
  var mask = 1;
  opcode = opcode || 1;
  var meta = generateMetaData(fin, opcode, mask, payload);
  var sendData = Buffer.concat([meta, payload], meta.length + payload.length);
  toClient.write(sendData);
}
var sockie = new Sockie(null,null,port=>{
    console.log("web sockie listen:"+port);
    //第一次握手
    const client = net.createConnection({ port: port })
    
    client.on("connect",() => {
        console.log('已连接到服务器');

        //第二次握手
        var requestHeader = `GET /chat HTTP/1.1\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nHost: 127.0.0.1:8001\r\nOrigin: http://127.0.0.1:8001\r\nSec-WebSocket-Key: hj0eNqbhE/A0GkBXDRrYYw==\r\nSec-WebSocket-Version: 13\r\n`
        client.write(requestHeader);
      });

      client.on("data",(data) => {
        var clientHeader = readHeaders( data.toString().replace("\r\n\r\n","").split('\r\n') );
        if(clientHeader["sec-websocket-accept"]){
          // 第三次握手
          var msg = `hello sockit server`
          var payload = Buffer.from(msg);
          sendMessage(client,payload)
        }

      });
});

