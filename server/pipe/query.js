const nodeUrl = require('url');
const qs = require("querystring");
const m3 = 3 * 1024 * 1024; //3mb大小
const output = rap.system.output;
const uploadFileTemplPath = localRequire("@/server/templ/uploadFile", true);
var fileUUID = 0;
output.removeSync(uploadFileTemplPath);
output.createSync(uploadFileTemplPath);

function parsePostParams(obj, set, next) {

  var fileId, position = 0;
  if (obj.binaryFlag) {
    //断点续传

    if (obj.range) {
      fileId = obj.range.split("-")[0];
      position = obj.range.split("-")[1] * 1 || 0;
    } else {
      fileUUID++;
      fileId = fileUUID
    }
    file = `${uploadFileTemplPath}/templ_stream${fileId}.tpl`
  }



  //可能数据很大时候，需要用代理
  var postBuffer = Buffer.alloc(0);


  /**
   * 因为post方式的数据不太一样可能很庞大复杂，
   * 所以要添加监听来获取传递的数据
   * 也可写作 req.on("data",function(data){});
   */
  set.addListener("data", function(data) {
    postBuffer = Buffer.concat([postBuffer, data]);
    //大文件上传
    if (obj.binaryFlag) {
      if (postBuffer.length > m3) {
        output.writeSplitSync(file, postBuffer, position);
        position += postBuffer.byteLength;
        postBuffer = Buffer.alloc(0); //重新生成一个buffer
      }
    } else if (postBuffer.length > m3) {
      throw new Error("post data too large");
    }

  });
  /**
   * 这个是如果数据读取完毕就会执行的监听方法,_serverTemplateFile
   */
  set.addListener("end", function() {

    if (obj.binaryFlag) {
      if (postBuffer.byteLength) {
        output.writeSplitSync(file, postBuffer, position);
        position += postBuffer.byteLength;
      }
      //分段上传
      obj.query._serverTemplateFile = file;
      obj.query.response = obj.query.response || {};
      obj.query.response["x-binary-range"] = fileId + "-" + position;
    } else {
      obj.query = Object.assign(obj.query, qs.parse(postBuffer.toString("utf8")));
    }
    next(obj.query);
    postBuffer = null;
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
  run.inPipe.tapAsync({
    name: "query",
    fn(request, response, next) {
      //提前解析了
      if (request.rap.query) {
        next();
        return
      }
      /**
       * 也可使用var query=qs.parse(url.parse(req.url).query);
       * 区别就是url.parse的arguments[1]为true：
       * ...也能达到‘querystring库’的解析效果，而且不使用querystring
       */

      request.rap.query = nodeUrl.parse(request.url, true).query;

      switch (request.rap.method) {
        case "POST":
          parsePostParams(request.rap, request, () => {
            paramsTypeConvert(request.rap.query);;
            next();
          });
          break;
        default: //get，delete
          request.rap.binaryFlag = false;
          paramsTypeConvert(request.rap.query);

          next();
      }

    }
  });

  run.outPipe.tapAsync({
    name: "query",
    fn(request, response, next) {
      let query = request.rap.query;
      if (query.response && query.response["x-binary-range"]) {
        response.setHeader("x-binary-range", query.response["x-binary-range"])
      }
      next();
    }
  })
}