const qs = require("querystring");
module.exports = function(run, timeout) {
  //获取公共信息
  run.inPipe.tapAsync({
    name: "init",
    fn(request, response, next) {
      var obj = {
        isXMLHttpRequest(set) {
          var xReq = set.headers['x-requested-with']
          return (xReq && (xReq.toLowerCase() == "XMLHttpRequest".toLowerCase()))
        },
        ip(set) { //解析ip，ipv6(::ffff:ip或者::1)
          var ip = set.client.localAddress;
          return ip && ip.replace("::ffff:", "").replace("::1", "127.0.0.1");
        },
        port: function(set) {
          return set.client.localPort;
        },
        url(set) {
          let url = set.url.replace(/\?.*$/, "").replace(/#.*$/, "");
          url = decodeURIComponent(url.trim());
          return url;
        },
        method(set) {
          return set.method.toUpperCase();
        },

        orgUrl(set) {
          return set.url;
        },
        //二进制文件
        binaryFlag(set) {
          return set.headers['x-binary-flag'];
        },
        //续点
        range(set) {
          return set.headers['x-binary-range'];
        },
        //请求时间
        date() {
          return new Date().getTime();
        }
      };
      //得到属性
      for (var i in obj) {
        obj[i] = obj[i](request);
      }
      //定义request的rap,用于存储rquest信息
      if (!response.rap) {
        response.rap = obj;
      } else {
        response.rap = Object.assign(response.rap, obj);
      }

      //异步才会超时
      // if (ENV == "product") {
        response.rap.timer = setTimeout(() => {
          throw Error("Request Timeout");
        }, timeout || 120000);
      // }
      next();
    }

  });

  //获取公共信息
  run.outPipe.tapAsync({
    name: "init",
    fn(request, response, next) {

      let timer = response.rap && response.rap.timer
      if (timer) {
        clearTimeout(timer);
      }
      //分块传输
      response.setHeader("Connection", "keep-alive");
      response.setHeader("Content-Type", "text/plain"); //默认
      response.setHeader("X-Powered-By", "robert-rap-server"); //默认
      next();
    }
  })

  //一旦发生错误，必须清除掉定时器
  run.error.tapAsync({
    name: "init",
    fn(err, response, comfrom, next) {
      let timer = response.rap && response.rap.timer
      if (timer) {
        clearTimeout(timer);
      }
      next();
    }
  })

}