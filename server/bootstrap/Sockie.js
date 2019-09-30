const FIN = 1;
const net = require('net');
const crypto = require('crypto');
const stream = require('stream');
const domain = require('domain');
const querystring = require('querystring');
const CONNECTING = 1;
const OPEN = 2;
const CLOSE = 3;
const MAXBufferSize = 2 * 1024 * 1024; //2M
const clientList = [];
const clientListMap = {}
var clientListBlacklist = {}; //黑名单
var uuid = 0;

class Sockie {

  constructor(runner,port, log) {
    this.server = net.createServer(null, this.middleHandle);
    this.server.listen(port || 8001);
    this.clientMap = {};
    this.runner = runner;//http或者https服务器
    this.log = log || function() {};
  }
  //socket中间层
  middleHandle(client) {
    client.rap = {};
    client.rap.uuid = uuid++;
    client.rap.status == CONNECTING;
    this.bindReadAble(client);
    this.bindReadMsg(client);
    this.bindClose(client);
  }
  //解析数据
  bindReadAble(client) {

    let totalBuffer = Buffer.alloc(0);
    client.on("readable", function() {
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
          this.clientMap[client.rap.uuid] = client;
          //读数据状态
        } else if (client.rap.status == OPEN && waitMessage(client, totalBuffer)) {
          totalBuffer = Buffer.alloc(0);
        }
      } catch (e) {
        this.log(e)
      }
    })
  }
  //解析完成
  bindReadMsg(client) {
    client.on("text", function(text) {
        try {
          var clientMsg = JSON.parse(text);
        } catch (e) {
          clientMsg = {};
        }
        switch (clientMsg.type) {
          case "action":
            var { request, response } = createInComingMassegeAndServerResponse();
            this.runner.http.middleHandle(request, response)
            break;
          case "chat":
          default:
            this.log("can not parse massage!");
        }
      })

    }
    //关闭
    bindClose(client) {
      client.on("close", function(code, text) {
          sendMsg(client, text, "error", client);
          clientList.splice(index, 1);
        client.removeAllListeners();
        client.end()
      });
    }

  }

  //模拟创建一个request和response
  function createInComingMassegeAndServerResponse() {

    //全部转化为get请求
    var request = {
      method: "GET",
      url: clientMsg.url,
      isSocket: true, //socket标志
      headers: {
        cookie: client.cookie,
        accept: "*/*",
      },
      rap: {
        query: clientMsg.data || {},
      }

    };
    var response = {
      socket: client,
      writeHead: function() {},
      pipe: function() {

      },
      end: function(ret) {
        sendMsg(client, ret, "action", client, clientMsg.sendId);
      }
    }
    return { request, response }
  }


    /**
     *
     * 核心代码
     */
    function hanldeSocket(client) {
      client.rapStatus = CONNECTING;
      var totalBuffer = Buffer.alloc(0);
      var dataBuffer = Buffer.alloc(0);
      client.rapid =
        client.rapTime = new Date().getTime();
      chatServer.emit("rapBroadcast", client.rapid, "create");
      //握手、通信
      client.on("readable", function() {
        try {
          var buffer = client.read();
          totalBuffer = Buffer.concat([totalBuffer, buffer], totalBuffer.length + buffer.length);
          if (!isEndBuffer(client, totalBuffer)) {
            return
          }
          if (client.rapStatus == CONNECTING && waitConnection(client, totalBuffer)) {
            client.rapStatus = OPEN;
            totalBuffer = null;
            totalBuffer = Buffer.alloc(0);
            clientList.push(client);
            clientListMap[client.rapid] = clientList.length - 1;
            chatServer.emit("rapConnection", client.rapid);
          } else if (client.rapStatus == OPEN && waitMessage(client, totalBuffer, dataBuffer)) {
            dataBuffer = null;
            totalBuffer = null;
            totalBuffer = Buffer.alloc(0);
          }
        } catch (e) {
          rap.error("socket readable", e && e.message, e && e.stack);
        }
      })
    );
    client.on("close", function(code, text) {
      if (client == null) {
        return;
      }
      var index = clientList.indexOf(client);
      if (index != -1) {
        client.rapStatus = CLOSE;
        sendMsg(client, text, "error", client);
        clientList.splice(index, 1);
        for (var i = index; i < clientList.length; i++) {
          clientListMap[clientList[i].rapid] = i;
        }
      }
      client.removeAllListeners();
      client.end()
      clientListMap[client.rapid] = null;
      client = null;
    });
  }