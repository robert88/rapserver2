require("./global/global.localRequire.js")
const toPath = localRequire("@/server/lib/node_modules/enhanced-resolve/lib/toPath.js");

class ActionMap {
  constructor(val, child) {
    this.child = child,
      this.value = val
  }
}

function isActionMap(obj) {
  if (Object.prototype.toString.call(obj) == "[object Object]" && obj instanceof ActionMap) {
    return true;
  }
}

// var a = new ActionMap(1);
// setActionMap(a, "/a/b///", 1)
// setActionMap(a, "/a/cc///", 1)
// setActionMap(a, "/a/cc//d/", 3)
// setActionMap(a, "/a/", 1);
// setActionMap(a, "/", 8);
// setActionMap(a, "/b/:b", 8);

//得到{value:8,child:{a:{value:1,child:{b:{value:1,child:undefined},cc:value:3,child:{d:{value:3,child:undefined}}}}}}}

// console.log(getActionMap(a,"/"))
// console.log(getActionMap(a,"/a/b"))
// console.log(getActionMap(a,"/a/cc"))
// console.log(getActionMap(a,"/a//cc/d"))
// console.log(getActionMap(a,"/a/"))
// console.log(getActionMap(a,"/a/d"))



function setActionMap(obj, filePath, val) {
  filePath = toPath((filePath || "").trim()); //toPath会去掉最后一个/
  if (!isActionMap(obj)) {
    throw new Error("obj must instanceof ActionMap");
  }

  // filePath="/"
  if (!filePath) {
    obj.value = val;
    return;
  }

  var sFile = filePath.split("/");
  sFile.forEach((item, index) => {
    item = item.trim();
    if (!item) {
      return;
    }
    let queryName;
    if (item.indexOf(":") == 0) { //动态路由
      queryName = item.replace(":", "");
      item = "*";
    }

    obj.child = obj.child || {}; //确保有子项

    if (index == sFile.length - 1) { //最后一项
      if (!isActionMap(obj.child[item])) {
        obj.child[item] = new ActionMap(val);
      } else {
        obj.child[item].value = val;
      }
    } else {
      if (!isActionMap(obj.child[item])) {
        obj.child[item] = new ActionMap(obj.child[item]);
      }
    }
    obj = obj.child[item];
    if (queryName) {
      obj.query = queryName
    }
  })
}

/**
 * 
 * 根据url来得到路由对象
 * queryCallback
 * retObj表示返回一个对象
 * */

function getActionMap(obj, filePath, queryCallback,retObj) {
  filePath = toPath((filePath || "").trim()); //toPath会去掉最后一个/
  if (!isActionMap(obj)) {
    throw new Error("obj must instanceof ActionMap");
  }

  // filePath="/"
  if (!filePath) {
    return obj.value;
  }
  let error = false
  var sFile = filePath.split("/");
  var ret;
  sFile.forEach((item, index) => {
    if (error || !item) {
      return;
    }
    if (!isActionMap(obj.child[item])) {
      if (obj.child["*"]) { //动态路由
        queryCallback(item, obj.child["*"].query);
        item = "*";
      } else {
        error = true;
        return
      }
    }

    if (index == sFile.length - 1) {
      ret = obj.child[item].value;
    } 
    obj = obj.child[item];
  })
  if (error) {
    return null;
  }
  if(retObj){
    return obj;
  }
  return ret;
}


module.exports = {
  ActionMap,
  getActionMap,
  setActionMap,
  isActionMap
};