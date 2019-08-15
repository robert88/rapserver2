const nodeUrl = require('url');
const qs = require("querystring");
const k900 = 100 * 9512;
const output = rap.system.output;
const uploadFileTemplPath = localRequire("@/server/templ/uploadFile", true);
var fileUUID = 0;
output.removeSync(uploadFileTemplPath);
output.createSync(uploadFileTemplPath);

function parsePostParams(obj, set, next) {

  var fileId;
  if (obj.binaryData) {
    //断点续传

    if(obj.range){
      fileId = obj.range
    }else{
      fileUUID++;
      fileId = fileUUID
    }
    file = `${uploadFileTemplPath}/templ_stream${fileId}.tpl`
  }



  //可能数据很大时候，需要用代理
  var postBuffer = Buffer.alloc();


  /**
   * 因为post方式的数据不太一样可能很庞大复杂，
   * 所以要添加监听来获取传递的数据
   * 也可写作 req.on("data",function(data){});
   */
  set.addListener("data", function(data) {
    //大文件上传
    if (obj.binaryData) {
      postBuffer = Buffer.concat([postBuffer,data]);
      output.writeSync(file, postBuffer, true, "binary");
      if (postBuffer.length > k900) {
        postBuffer =  Buffer.alloc();//重新生成一个buffer
      }
    } else if (postBuffer.length > k900) {
      throw new Error("post data too large");
    } else {
      postBuffer.concat(data);
    }

  });
  /**
   * 这个是如果数据读取完毕就会执行的监听方法,_serverTemplateFile
   */
  set.addListener("end", function() {
    file = `${uploadFileTemplPath}/templ_stream${fileUUID}.tpl`
    if (obj.binaryData) {
      //分段上传
      params._serverTemplateFile=file;
      params.response=params.response||{};
      params.response["x-binary-range"] = fileId;
    } else {
      params = Object.assign(obj.query, qs.parse(postBuffer.toString("utf8")));
    }
    next(params);
    postBuffer = null;
    params = null;
  });
}


/**
 * 参数类型转换
 * */
function paramsTypeConvert(params) {
  //bool值的
  for (var k in params) {
    if (params[k] === "true") {
      params[k] = true;
    } else if (params[k] === "false") {
      params[k] = false;
    } else if (typeof params[k] == "object") {
      paramsTypeConvert(params[k]);
    }
  }
  return params;
}

module.exports = function(run) {
  run.pipe.tapAsync({
    name: "query",
    fn(request, response, next) {

      var obj = {
        url(set) {
          let url = set.url.replace(/\?.*$/, "").replace(/#.*$/, "");
          url = decodeURIComponent(url.trim());
          return url;
        },
        query(set){
            /**
         * 也可使用var query=qs.parse(url.parse(req.url).query);
         * 区别就是url.parse的arguments[1]为true：
         * ...也能达到‘querystring库’的解析效果，而且不使用querystring
         */
         return nodeUrl.parse(set.url, true).query;
        },
        method(set) {
          return set.method.toUpperCase();
        },
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
        orgUrl(set) {
          return set.url;
        },
        cookies(set) {
          var cookies = set.headers["cookie"];
          return cookies && qs.parse(cookies.replace(";", "&")) || {}
        },
        //二进制文件
        binaryData(set) {
          return set.headers['x-binary-data'];
        },
        //续点
        range(set) {
          return set.headers['x-binary-range'];
        }
      };

      //得到属性
      for (var i in obj) {
        obj[i] = obj[i](request, next);
      }

      switch (obj.method) {
        case "POST":
          parsePostParams(obj, request, () => {
           paramsTypeConvert(obj.query);;
            request.rap = obj;
            next();
          });
          break;
        default: //get，delete
        obj.binaryData = false;
        paramsTypeConvert(obj.query);
        request.rap = obj;
        next();
      }

    }
  });
}

