const qs = require("querystring");
const ONEYEAR = 1000 * 60 * 60 * 24 * 365;
/**
 * 支持{name:{value:"",HttpOnly:true ... }}
 *  *支持["name=value;",]
 * */
rap.cookie = {
  parse(cookies) {
    var ret = [];
    for (var name in cookies) {
      var cookie = cookies[name];
      if (typeof cookie == "object") {
        cookie.name = name;
        ret.push(this.stringify(cookie));
      } else {
        ret.push(this.stringify({
          name: name,
          value: value
        }));
      }
    }
    if (ret.length) {
      return ret.join(";").replace(/\s+/g, "");
    }
    return "";
  },
  stringify(obj) {
    var name = obj.name,
      value = obj.value,
      HttpOnly = obj.HttpOnly,
      path = obj.path,
      Expires = obj.Expires;
    if (!name) {
      return "";
    }
    value = value == null ? "null" : value;
    HttpOnly = HttpOnly ? "HttpOnly;" : "";
    path = path || "/";

    if (Expires instanceof Date) {
      Expires = Expires.toGMTString();
    } else if (typeof Expires == "number") {
      if (Expires < ONEYEAR) {
        Expires = new Date(new Date().getTime() + Expires).toGMTString();
      } else {
        Expires = new Date(Expires).toGMTString();
      }
    }
    Expires = Expires && (`Expires=${Expires};`) || ""
    return `${name}=${value};${Expires} path=${path};${HttpOnly}`;
  }
}