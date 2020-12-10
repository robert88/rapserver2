/*cookie和session*/
const qs = require("querystring");

module.exports = function(run, staticMap) {

  let rapid = 0;
  let startTime = new Date().getTime();

  //request
  run.inPipe.tapAsync({
    name: "cookie",
    fn(request, response, next) {

      var cookie = request.headers["cookie"];

      var requestCooike = {};
      let parseCookie = cookie && qs.parse(cookie.replace(/;/g, "&")) || {}
      for (let k in parseCookie) {
        requestCooike[k.trim()] = parseCookie[k].trim();
      }
      response.rap.cookie = {};

      //如果客户端是第一次那么就需要设置rapid,(这是浏览器的自动功能，用户不会察觉到），当服务器处理完这个表单后，将结果返回给rapid==SessionId
      if (!requestCooike.cookie["RAPID"]) {
        var userAgent = request.headers["user-agent"] || "";
        // let ip = request.ip && request.ip || "0.0.0.0";
        //客户端类型/系统类型/系统位数/系统版本/浏览器/浏览器版本/浏览器厂家
        let userAgentSplit = rap.userAgent(userAgent).split(/\//)
        let SessionId = rap.AES(startTime + "/" + (rapid++));

        if (userAgent) {
          response.rap.cookie["RAPID"] = {
            //客户端类型+系统类型+浏览器+第一次请求时间戳+rapid
            value: encodeURIComponent(userAgentSplit[0] + "_" + userAgentSplit[1] + "_" + userAgentSplit[4] + "_" + userAgentSplit[5].split(".")[0] + "_" + SessionId),
            HttpOnly: true
          }
        } else {
          response.rap.cookie["RAPID"] = {
            value: encodeURIComponent("rap_sys_brw_ver" + SessionId),
            HttpOnly: true
          }
        }
      }

      next();

    }
  })

  //response
  run.outPipe.tapAsync({
    name: "cookie",
    fn(request, response, next) {
      response.setHeader("Set-Cookie", rap.cookie.parse(response.rap.cookie));
      next();
    }
  })
}