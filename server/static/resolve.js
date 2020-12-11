const pt = require("path");
/*
源路径转源路径的物理路径,不需要最后一个/
*/
var root = __dirname.toURI().replace(/\\+$/, "")

/**
 * 
 * 线上路径或者不可用路径
 */
function isHttp(src) {
  if (!src) {
    return ""
  }
  src = src.trim()
  return src.indexOf("http") == 0 || src.indexOf("//") == 0 || src.indexOf("javascript:") == 0 || src.indexOf("data:") == 0 || src.indexOf(">") != -1
}

/*
源物理路径
*/
rap.parse.input = function(templatePath, resolvePath) {
  if (!resolvePath) {
    return "";
  }

  resolvePath = resolvePath.trim().toURI();

  if (!templatePath) {
    return resolvePath
  }

  if (resolvePath.indexOf("/") == 0) {
    return (root + "/" + resolvePath).toURI();
  } else if (/^\w:/i.test(resolvePath)) {
    return resolvePath;
  } else {
    return pt.resolve(pt.dirname(templatePath), resolvePath);
  }
}


/*
源路径转目标路径的物理路径
*/
rap.parse.output = function(templatePath, resolvePath, type) {
  resolvePath = resolvePath && resolvePath.trim() || "";
  let ret;
  if (!resolvePath) { //当前路径不存在
    return "";
  }
  if (!templatePath) { //模板文件不存在
    return resolvePath
  }
  if (isHttp(resolvePath)) { //当前路径是绝对路径
    return resolvePath
  }
  if (pt.extname(resolvePath) == ".less") {
    type = ".css"
  }
  if (pt.extname(resolvePath) == ".es") {
    type = ".js"
  }
  if (type) { //替换文件类型
    resolvePath = resolvePath.replace(/\.\w+$/, "") + type;
  }
  if (resolvePath.indexOf("/") == 0) { //跟路径
    ret = (root + resolvePath.trim()).toURI();
  } else if (!(/^\w:/i.test(resolvePath))) { //相对路径
    ret = pt.resolve(pt.dirname(templatePath), resolvePath).toURI();
  } else {
    ret = resolvePath;
  }

  // 将路径做变更
  if (~ret.indexOf("/src/html")) {
    ret = ret.replace("/src/html/", "/dest/rapserver/"); //html
  } else {
    ret = ret.replace("/src/", "/dest/rapserver/"); //assert
  }


  return ret;
}


/*
 *源路径转浏览器地址,可以指定后缀名
 *使用相对路径请以src目录作为相对路径的根路径
 */
rap.parse.browser = function(resolvePath, type) {

  if (!resolvePath) {
    return "";
  }

  resolvePath = resolvePath.trim().toURI();

  if (isHttp(resolvePath)) { //当前路径是绝对路径
    return resolvePath
  }
  if (pt.extname(resolvePath) == ".less") {
    type = ".css"
  }
  if (pt.extname(resolvePath) == ".es") {
    type = ".js"
  }
  if (type) {
    resolvePath = resolvePath.replace(/\.\w+$/, "") + type;
  }


  if (resolvePath.indexOf("/") == 0) {
    var ret = resolvePath;
    // 将路径做变更
    if (~ret.indexOf("/src/html/")) {
      ret = ret.replace("/src/html/", "/rapserver/"); //html
    } else {
      ret = ret.replace("/src/", "/rapserver/"); //assert
    }
    return ret;
  } else if (/^\w:/i.test(resolvePath)) {
    return resolvePath.replace(root, "").replace("/src/html/", "/rapserver");
  } else {
    return resolvePath;
  }
}
/*
 *找到html对应的资源文件
 */
rap.parse.parseRelativePath = function(templatePath, resolvePath) {
  var src = rap.parse.input(templatePath, resolvePath);
  return src.toURI().replace(root.toURI(), "");
}