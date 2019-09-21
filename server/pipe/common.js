

const qs = require("querystring");
module.exports = function(run,timeout) {
  //获取公共信息
  run.inPipe.tapAsync({
    name: "init",
    fn(request, response, next) {
      var obj = {
        isXMLHttpRequest(set) {
          var xReq = set.headers['x-requested-with']
          return (xReq && (xReq.toLowerCase() == "XMLHttpRequest".toLowerCase()))
        },
        ip(set) {
          var ip = set.client.localAddress;
          return ip && ip.replace("::ffff:", "");
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
        binaryData(set) {
          return set.headers['x-binary-data'];
        },
        //续点
        range(set) {
          return set.headers['x-binary-range'];
        },
        //请求时间
        date(){
          return new Date().getTime();
        }
      };
      //得到属性
      for (var i in obj) {
        obj[i] = obj[i](request);
      }
      //定义request的rap
      request.rap = obj;
      response.rap = {}
      //异步才会超时
      request.rap.timer = setTimeout(()=>{
        throw Error("request timeout");
      },timeout||120000);
      next();
    }

  });

  //合并公共信息
  run.inPipe.tapAsync({
    name: "end",
    fn(request, response, next) {
      next();
    }
  });

  //获取公共信息
  run.outPipe.tapAsync({
    name: "init",
    fn(request, response, next) {
            
      //分块传输
      response.setHeader("Connection", "keep-alive");
      clearTimeout(request.rap.timer)
      next();
    }
  })

}