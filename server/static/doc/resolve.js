var root = __dirname.toURI().replace("/server/static", "");
const pt = require("path");
function inputResolve(templatePath, resolvePath) {
  if(!resolvePath){
    return "";
  }
  if(!templatePath){
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
function outputResolve(templatePath, resolvePath, type) {
  resolvePath =  resolvePath&&resolvePath.trim().toURI()||"";
  if(!resolvePath){
    return "";
  }
  if(!templatePath){
    return resolvePath
  }
  var dirNameSpace = rap.parse&&rap.parse.outputName||"dist";
  if (type) {
    resolvePath = resolvePath.replace(/\.\w+$/, "." + type);
  }
  if (resolvePath.indexOf("/") == 0) {
    return (root + `/${dirNameSpace}/` + resolvePath.trim()).toURI();
  } else if (/^\w:/i.test(resolvePath) || (/^https?:/i.test(resolvePath))) {
    if(~resolvePath.indexOf(root)){
      return (root + `/${dirNameSpace}/` + resolvePath.replace(root,"")).toURI();
    }else{
      return resolvePath;
    }
  } else {
    return pt.resolve(pt.dirname(templatePath), resolvePath).toURI().replace(root, root + `/${dirNameSpace}/`);
  }
}

/*
源路径转浏览器地址,可以指定后缀名
*/
function browserResolve(resolvePath, type) {
  if(!resolvePath){
    return "";
  }
  var dirNameSpace = rap.parse&&rap.parse.outputName||"dist";
  if (type) {
    resolvePath = resolvePath.replace(/\.\w+$/, "." + type);
  }
  if (resolvePath.trim().toURI().indexOf("/") == 0) {
    return (`/${dirNameSpace}/` + resolvePath.trim()).toURI();
  } else if (/^\w:/i.test(resolvePath) || (/^https?:/i.test(resolvePath))) {
    return resolvePath;
  } else {
    return resolvePath;
  }
}

module.exports = {
  input:inputResolve,
  output:outputResolve,
  browser:browserResolve
}