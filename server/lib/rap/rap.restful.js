/**
 * url中参数中proxy必须为true
 * *proxyHost为域名
 * proxyProtocol协议默认为http
 * */
const https = require("https");
const http = require("http");
const { URL } = require('url');
const querystring = require('querystring');
const zlib = require("zlib");
const fs = require("fs")
const pt = require("path");
const m3 = 3 * 1024 * 1024; //3mb大小
// const gunzip = zlib.createGunzip
// "deflate": zlib.createInflate
//提供toUri
localRequire("@/server/lib/global/extention.String.js")

// const key = fs.readFileSync(localRequire('@/server/exe/ssl/localhost.key', true));
// const cert = fs.readFileSync(localRequire('@/server/exe/ssl/localhost.crt', true));

global.rap = global.rap || {};

rap.rest = function(options) {

  if (typeof options !== "object") {
    throwError("restful options must object");
  }

  if (!options.url) {
    throwError("restful options must have url");
  }

  var urlOptions = new URL(options.url);

  urlOptions.protocol = urlOptions.protocol == "https:" ? "https:" : "http:";
  // urlOptions.protocol = "http:"
  var opt = {
    protocol: urlOptions.protocol,
    port: urlOptions.port || (urlOptions.protocol == "https:" ? 443 : 80),
    hostname: urlOptions.hostname,
    host: urlOptions.host,
    path: urlOptions.href.replace(urlOptions.origin, "").toURI(),
    method: (options.method || "GET").toUpperCase(), //这里是发送的方法
    headers: options.headers || {},
    agent: false,
    // key: urlOptions.protocol == "https:" ? key : "",
    // cert: urlOptions.protocol == "https:" ? cert : ""
  }

  var accept = {
    "*": "*/*",
    html: "text/html",
    json: "application/json, text/javascript",
    script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript",
    text: "text/plain",
    xml: "application/xml, text/xml",
    file: "multipart/form-data",
    binary: "application/octet-stream"
  }
  if (options.dataType && accept[options.dataType]) {
    opt.headers['Accept'] = accept[options.dataType]
  } else {
    opt.headers['Accept'] = '*/*';
  }
  opt.headers['Content-Type'] = "text/html" //"application/x-www-form-urlencoded; charset=UTF-8";
  opt.headers['User-Agent'] = "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36/rapserver";
  opt.headers['Origin'] = "http://localhost:1024";
  opt.headers['Referer'] = "http://localhost:1024/index";
  opt.headers['host'] = opt.host

  var protocol = http;
  if (urlOptions.protocol == "https:") {
    protocol = https;
  }
  var error;
  var req = protocol.request(opt, function(res) {


    var buffer = Buffer.alloc(0);
    res.on('data', function(data) {
      if (buffer.length > m3) {
        res.destroy(new Error("rest data too large"));
      } else {
        buffer = Buffer.concat([buffer, data]);
      }
    }).on('end', function() {
      if (error) {
        buffer = null;
        return;
      }
      var finishData;
      if (res.headers["content-encoding"] && (~res.headers["content-encoding"].indexOf("gzip"))) {
        finishData = zlib.unzipSync(buffer).toString("utf8")
      } else {
        finishData = buffer.toString("utf8")
      }
      if (res.statusCode < 400) {
        if (typeof options.success == "function") {
          options.success(finishData, res);
        }
      } else {
        if (typeof options.error == "function") {
          options.error(finishData);
        }
      }
      buffer = null;
    });


    //
  }).on('error', function(e) {
    error = true;
    if (typeof options.error == "function") {
      options.error(e);
    }
  });
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0
  //如何是post请求就直接将params做为请求体$.ajax和querystring.stringify都是区分数字和字符串
  if (opt.method == "POST") {
    req.write(querystring.stringify(options.data));
  }

  req.end();
}