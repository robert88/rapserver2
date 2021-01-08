const FIN = 1;
const net = require('net');
const crypto = require('crypto');
const stream = require('stream');
const domain = require('domain');
const querystring = require('querystring');
// 引入 events 模块
var events = require('events');

const CONNECTING = 1;
const OPEN = 2;
const CLOSE = 3;
const MAXBufferSize = 2 * 1024 * 1024; //2M
const clientList = [];
const clientListMap = {}
var clientListBlacklist = {}; //黑名单
var uuid = 0;

const errerCode = {
  1000: "连接正常关闭",
  1001: "端点离线，例如服务器down，或者浏览器已经离开此页面",
  1002: "端点因为协议错误而中断连接",
  1003: "端点因为受到不能接受的数据类型而中断连接",
  1004: "保留",
  1005: "保留, 用于提示应用未收到连接关闭的状态码",
  1006: "端点异常关闭",
  1007: "端点收到的数据帧类型不一致而导致连接关闭",
  1008: "数据违例而关闭连接",
  1009: "收到的消息数据太大而关闭连接",
  1010: "客户端因为服务器未协商扩展而关闭",
  1011: "服务器因为遭遇异常而关闭连接",
  1015: "TLS握手失败关闭连接"
}
/**
 *
 * 判断流是否结束
 * buffer可以分段传输
 * 可以人为限制流的大小，
 * *\r\n\r\n结束符号
 */
function isEndBuffer(client, buffer) {
  var len = buffer.length;
  if (len > MAXBufferSize) {
    client.emit("error", "out limit buffer size");
  }
  var bufferString = buffer.toString();
  if (bufferString.indexOf("\r\n\r\n")) {
    return true;
  }
  return false;
}
/**
 *
 * 解析头部
 * xx:xx这样的格式为头部格式
 */
function readHeaders(lines) {
  var headers = {};
  var i, match;
  for (i = 1; i < lines.length; i++) {
    if ((match = lines[i].match(/^([a-z-]+): (.+)$/i))) {
      headers[match[1].toLowerCase()] = match[2];
    }
  }
  return headers;
}
/**
 *
 * 写入客户端信息
 * 头部信息要还原xxx:xxx格式
 * 行通过"\r\n"来分割
 */
function buildRequest(httpLine, headers) {
  var headerString = httpLine + '\r\n',
    headerName

  for (headerName in headers) {
    headerString += headerName + ': ' + headers[headerName] + '\r\n'
  }

  return headerString + '\r\n'
}

/**
 *TCP数据报结构：https://blog.csdn.net/qq_31001889/article/details/80552158
 * 第一个参数包含是不是fin包，包的类型
 * bit是8位的数据
 * 完整的帧
 * 0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31
 * f r r r opcode| m payload length    |                       |
 * i s s s 4bit    a           7bit    | extended payload length
 * n v v v         s                   |   
 *                 k
 * MASK值，从客户端进行发送的帧必须置此位为1，从服务器发送的帧必须置为0。如果任何一方收到的帧不符合此要求，则发送关闭帧(Close frame)关闭连接。
opcode的值： 0x1代表此帧为文本数据帧, 0x2代表此帧为二进制数据帧, 0x8为控制帧中的连接关闭帧(close frame), 0x9为控制帧中的Ping帧, 0xA(十进制的10)为控制帧中的Pong帧。
Ping/Pong帧： Ping帧和Pong帧用于连接的保活(keepalive)或者诊断对端是否在线。这两种帧的发送和接收不对WEB应用公开接口，由实现WebSocket协议的底层应用(例如浏览器)来实现它。

转为buffer之后,那么buffer0-》
 0x 1 0 0 0 1 0 0 0
    f r r opcode
    i s s
    n v v
后面的code也是这样的分割
 */

function parseFirstBuffer(client, bit) {

  //fin帧 4，5，6是保留字段，基本是0，如果不是这个规则就有问题，
  var FINFlag = bit >> 4;
  if (FINFlag % 8) {
    client.emit("error", "fin flag error");
    return null
  }

  //fin表示结束标志
  var fin = FINFlag === 8;

  //得到1-4位的值，opcode字段
  var msgType = bit % 16;

  //opcode只有这几个字段
  if (msgType !== 0 && msgType !== 1 && msgType !== 2 &&
    msgType !== 8 && msgType !== 9 && msgType !== 10) {
    client.emit("error", "invalid msg");
    return false
  }

  //控制帧必须一个buffer就可以接收完毕，不需要分段
  if (msgType >= 8 && !fin) {
    client.emit("error", "Control frames must not be fragmented");
    return false
  }
  return { fin: fin, type: msgType }
}
/**
 *
 * 如果bit位在最高两位，那么格式采用方式就不一样
 */
function parseSecondBuffer(client, bit, buffer, totalLen) {

  var hasMask = bit >> 7;

  // 客户端进行发送的帧必须置此位为1
  if (!hasMask) {
    client.emit("error", "Frames sent by clients must be masked");
    return false
  }

  //获取7位数据
  var dataLen = bit % 128;

  var start = 6; //加上了4位掩码，数据开始位置就是2+6

  // 网络协议大部分是大端模式，datalen最大值位127;如果是126后面2个bit来储存数据长度 ，127表示32位的数值，也就是说126之后就这个位就变成了类型位
  if (dataLen === 126) {
    dataLen = buffer.readUInt16BE(2) //2位offset从1开始计数，单位是1bit(8个位)为计数1,读取2个bit（16位），相当于读取第三和第四个buffer的值
    start += 2
  } else if (dataLen === 127) {
    //如果为127则用后面8个bit来储存数据长度，也就是64位
    //readUInt32BE(2):2位offset从1开始计数，单位是1bit(8个位)为计数1,读取4个bit
    dataLen = buffer.readUInt32BE(2) << 32 + buffer.readUInt32BE(6)
    start += 8
  }

  //dataLen + start是最小的要求长度
  if (totalLen < dataLen + start) {
    client.emit("error", "Not enough data in the buffer");
    return
  }

  return { hasMask: hasMask, dataLen: dataLen, start: start };
}
/**
 *
 * 解析负载
 * 由于客户端mask必须位1
 * 那么掩码就存在，那么所有数据都需要与掩码做一次异或运算，四个字节的掩码与所有数据字节轮流发生性关系。
 * 如果不存在掩码，即mask为0；那么后面的数据就可以直接使用
 */
function parsePayload(hasMask, dataLen, start, buffer) {
  //解析真实的数据，通过异或加密
  var payload = buffer.slice(start, start + dataLen);
  if (hasMask) {
    // Decode with the given mask
    var mask = buffer.slice(start - 4, start);
    for (var i = 0; i < payload.length; i++) {
      payload[i] ^= mask[i % 4];
    }
  }
  return payload;
}
/**
 *
 * 解析负载类型
 */
function parsePayloadType(client, fin, type, payload, perBuffer) {
  //合并之前的数据
  var dataBuffer;

  //二进制数据
  if (type === 2) {

    dataBuffer = perBuffer;

    if (!dataBuffer) {
      // Emits the 'binary' event
      dataBuffer = new stream.Readable();
      client.emit('binarystart', dataBuffer);
    }

    dataBuffer.push(payload);

    if (fin) {
      client.emit('binaryend', dataBuffer);
      dataBuffer.push(null);
      return true;
    }

    //close
  } else if (type === 8) {
    var code, reason
    if (payload.length >= 2) {
      code = payload.readUInt16BE(0)
      reason = payload.slice(2).toString()
    } else {
      code = 1005
      reason = ''
    }
    client.emit('close', code, reason)

  } else {

    dataBuffer = perBuffer ? Buffer.concat([perBuffer, payload], payload.length + perBuffer.length) : payload;

    if (type === 1) {
      // Save text frame
      dataBuffer = dataBuffer.toString()

      //数据没有分段，触发文本接收通知
      if (fin) {
        // Emits 'text' event
        client.emit('text', dataBuffer);
        return true;
      }

      // 9 Ping frame
    } else if (type === 9) {
      if (fin) {
        client.emit('Ping', dataBuffer);
      }
      //10 Pong frame
    } else if (type === 10) {
      if (fin) {
        client.emit('Pong', dataBuffer);
      }
    }
  }


}

/**
 *需要一次握手
 * @param client
 * @param buffer
 * @decoration 处理连接
 * 链接的buffer至少要6个长度
 * /r/n表示一行
 * 链接状态头部会带上sec-websocket-key来认证
 * 如果确认链接就要写会下面的加密方式到客户端Sec-WebSocket-Accept
 * 这样就完成链接
 */
function waitConnection(client, buffer) {

  var len = buffer.length;
  if (len < 6) {
    client.emit("error", "out limit buffer size");
    return false;
  }
  var bufferString = buffer.toString();
  var clientHeader = readHeaders(bufferString.replace("\r\n\r\n", "").split('\r\n'));
  // client.cookies = clientHeader["Cookie"]
  var clientKey = clientHeader['sec-websocket-key'];
  if (!clientKey) {
    client.emit("error", "client websocket key invalid");
    return false;
  }
  var sha1 = crypto.createHash('sha1');
  sha1.end(clientKey + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11');
  var key = sha1.read().toString('base64');
  var headers = {
    Upgrade: 'websocket',
    Connection: 'Upgrade',
    'Sec-WebSocket-Accept': key
  }
  client.write(buildRequest("HTTP/1.1 101 Switching Protocols", headers));
  return true;
}
/**
 *
 * 解析文本
 * 这个需要链接之后才能解析
 */
function waitMessage(client, buffer, perBuffer) {
  var len = buffer.length;
  if (len < 2) {
    client.emit("error", "out limit buffer size");
    return false;
  }

  var { fin, type } = parseFirstBuffer(client, buffer[0]);
  var { hasMask, dataLen, start } = parseSecondBuffer(client, buffer[1], buffer, len);
  var payload = parsePayload(hasMask, dataLen, start, buffer);
  if (payload) {
    parsePayloadType(client, fin, type, payload, perBuffer);
  }
  return fin;
}
/**
 *
 * 统一message
 */
function formatMessage(message, toid, fromid, type, sendId) {
  var defaultMsgOpts = {
    message: message == null ? "" : message,
    type: type,
    to: toid,
    sendId: sendId,
    from: fromid
  };

  return JSON.stringify(defaultMsgOpts);
}
/**

 * 完整的帧
 * 0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31
 * f r r r opcode| m payload length    |                       |
 * i s s s 4bit    a           7bit    | extended payload length
 * n v v v         s                   |   
 *                 k
 */
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


require("../lib/global/global.localRequire");
localRequire("@/server/lib/rap/rap.js");

class Sockie {

  constructor(runner, log, ready) {
    this.server = net.createServer(null, this.middleHandle.bind(this));
    rap.getPort(port => {
      this.port = port;
      this.server.listen(port);
      if (typeof ready == "function") {
        ready(port);
      }
    })

    this.clientMap = {};
    this.runner = runner; //http或者https服务器
  }
  //socket中间层
  middleHandle(client) {
    let d = domain.create();
    // 捕获异步异常
    d.on('error', (err) => {
      rap.console.error(err);
      delete this.clientMap[client.rap.uuid];
      client.removeAllListeners();
      client.end()
    });
    d.run(() => {
      client.rap = {};
      client.rap.uuid = uuid++;
      client.rap.status = CONNECTING;
      this.clientMap[client.rap.uuid] = client;
      this.bindReadAble(client);
      this.bindReadMsg(client);
      this.bindClose(client);
    })
  }
  //解析数据
  bindReadAble(client) {

    let totalBuffer = Buffer.alloc(0);

    client.on("readable", () => {
      try {
        let tempBuffer = client.read();
        totalBuffer = Buffer.concat([totalBuffer, tempBuffer]);
        //读取完整的buffer
        if (!isEndBuffer(client, totalBuffer)) {
          return
        }
        //链接状态
        if (client.rap.status == CONNECTING && waitConnection(client, totalBuffer)) {
          client.rap.status = OPEN;
          totalBuffer = Buffer.alloc(0);
          //读数据状态
        } else if (client.rap.status == OPEN && waitMessage(client, totalBuffer)) {
          totalBuffer = Buffer.alloc(0);
        }
      } catch (e) {
        rap.console.error(e.stack);
      }
    })
  }
  //解析完成调用的事件//自定义的
  bindReadMsg(client) {

    client.on("text", (text) => {
      //约定采用json方式传递
      try {
        //type,url,data,sendId
        var clientMsg = JSON.parse(text);
      } catch (e) {
        clientMsg = {};
      }
      switch (clientMsg.type) {
        case "action":
          var { request, response } = this.connectHttp(client, clientMsg);
          this.runner && this.runner.middleware(request, response)
          break;
        case "socket":
        default:
          rap.console.log("can not parse massage!");
      }
    })

    client.on("binaryend", (stream) => {

    })
    client.on("binarystart", (stream) => {

    })

    client.on("ping", (buffer) => {
      //发送一个pong
      this.sendMsg(client, client, buffer, "test", 10);
    })

    client.on("pong", (buffer) => {
      rap.console.log("server ping return")
    })

  }

  /*
   * 
   * @param {*} client 
   * @param {*} clientMsg 
   * 为了和http服务器对接
   */

  connectHttp(client, clientMsg) {
    var that = this;
    var request = {
      url: clientMsg.url,
      headers: {},
      client: { localAddress: "sockie", localPort: this.port },
      method: "GET",
      isSocket: true,
      cookies: querystring.parse(client.cookies, ";")
    };
    var response = Object.assign(new events.EventEmitter(), {
      rap: { query: clientMsg.data || {} },
      socket: client,
      finished: false,
      error: false,
      headMap: {},
      writeHead(code) {
        this._code = code;
      },
      setHeader: function(key, val) {
        this.headMap[key] = val;
      },
      removeHeader: function(key) {
        delete this.headMap[key]
      },
      end: function(ret) {
        var code = this._code;
        this.finished = true;
        //可以异步输出
        if (code == 200) {
          if (typeof ret == "string") {
            try {
              ret = { code: code, data: JSON.parse(ret) };
            } catch (e) {
              ret = { code: code, data: ret };
            }
          } else {
            ret = { code: code, data: ret };
          }
          that.sendMsg(client, client, ret, "action", clientMsg.sendId);
        } else {
          ret = { code: code };
          that.sendMsg(client, client, ret, "action", clientMsg.sendId);
        }

      }
    });

    response.on("pipe", function() {
      console.log("pipe")
    })
    return { request, response }
  }
  //关闭
  bindClose(client) {
    client.on("close", (code, text) => {
      text = text || errerCode[code];
      rap.console.warn("sockie uuid:",client.rap.uuid,"close by",text);
      // this.sendMsg(client, client, text, "close");
      delete this.clientMap[client.rap.uuid];
      client.removeAllListeners();
      client.end()
    });
  }

  /**
   *
   * 服务器发送消息给客户端
   * toClient目标客户端
   * fromClient来源
   * msg要发送的数据
   * type类型
   */
  sendMsg(toClient, fromClient, msg, type, sendId) {

    var opcode = 1;
    var fin = 1;
    var mask = 0

    if (toClient && toClient.writable && toClient.rap.status == OPEN) {

      var msgJson;

      if (type == "action") {
        msgJson = formatMessage(msg, toClient.rap.uuid, fromClient.rap.uuid, type, sendId);
      } else {
        msgJson = msg;
      }

      var payload = Buffer.from(msgJson);

      //结束fin=1，mask=0，opcode=1文本
      var meta = generateMetaData(fin, opcode, mask, payload);
      var sendData = Buffer.concat([meta, payload], meta.length + payload.length);
      toClient.write(sendData);
    } else {
      rap.console.warn("sendMsg error: target client writeable :", toClient && toClient.writable);
    }
  }
}


module.exports = Sockie