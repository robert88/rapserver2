const pt = require("path");
/*
源路径转源路径的物理路径
*/
var root = __dirname.toURI().replace("/server/build/compiler", "");

rap.parse.input = function(templatePath, resolvePath) {
  if (!resolvePath) {
    return "";
  }
  if (!templatePath) {
    return resolvePath
  }
  if (resolvePath.trim().toURI().indexOf("/") == 0) {
    return root + resolvePath.trim().toURI();
  } else if (/^\w:/i.test(resolvePath) || (/^https?:/i.test(resolvePath))) {
    return resolvePath;
  } else {
    return pt.resolve(pt.dirname(templatePath), resolvePath);
  }
}


/*
源路径转目标路径的物理路径
*/
rap.parse.output = function(templatePath, resolvePath, type) {
  resolvePath = resolvePath && resolvePath.trim().toURI() || "";
  if (!resolvePath) {
    return "";
  }
  if (!templatePath) {
    return resolvePath
  }
  var dirNameSpace = rap.parse.outputName || "dist";
  if (type) {
    resolvePath = resolvePath.replace(/\.\w+$/, "") + type;
  }
  if (resolvePath.indexOf("/") == 0) {
    return (root + `/${dirNameSpace}/` + resolvePath.trim()).toURI();
  } else if (/^\w:/i.test(resolvePath) || (/^https?:/i.test(resolvePath))) {
    if (~resolvePath.indexOf(root)) {
      return (root + `/${dirNameSpace}/` + resolvePath.replace(root, "")).toURI();
    } else {
      return resolvePath;
    }
  } else {
    return pt.resolve(pt.dirname(templatePath), resolvePath).toURI().replace(root, root + `/${dirNameSpace}/`);
  }
}

/*
源路径转浏览器地址,可以指定后缀名
*/
rap.parse.browser = function(resolvePath, type) {
  if (!resolvePath) {
    return "";
  }
  var dirNameSpace = rap.parse.outputName || "dist";
  if (type) {
    resolvePath = resolvePath.replace(/\.\w+$/, "") + type;
  }
  if (resolvePath.trim().toURI().indexOf("/") == 0) {
    return (`/${dirNameSpace}/` + resolvePath.trim()).toURI();
  } else if (/^\w:/i.test(resolvePath) || (/^https?:/i.test(resolvePath))) {
    return resolvePath;
  } else {
    return resolvePath;
  }
}

rap.parse.parseRelativePath = function(templatePath, resolvePath) {
  var src = rap.parse.input(templatePath, resolvePath);
  return src.replace(root, "");
}