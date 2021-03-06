const pt = require("path");
require("./global/global.localRequire.js");

const AsyncSeries = localRequire("@/server/lib/node_modules/enhanced-resolve/lib/AsyncSeries.js");

const toPath = localRequire("@/server/lib/node_modules/enhanced-resolve/lib/toPath.js");

const { getDefaultFile } = localRequire("@/server/lib/resolveFile.js")

localRequire("@/server/lib/global/global.js");

localRequire("@/server/lib/rap/rap.js");

async function findAll(root) {
  return await new Promise((resove, reject) => {
    rap.system.input.purge("all");
    // 参数：path, fileType, deep, filterFn, callback
    rap.system.input.findAll(root, null, true, null, (err, allFile) => {
      if (err) {
        reject(err);
        return;
      }
      resove(allFile);
    })
  })
}

async function getStat(file) {
  return await new Promise((resove, reject) => {
    rap.system.input.purge("stat", file);
    rap.system.input.stat(file, (err, stat) => {
      if (err) {
        reject(err);
        return;
      }
      resove(stat);
    });
  })
}

async function exsits(file){
  let a
  try{
     a =  await getStat(file);
  }catch(e){
    a =false;
  }
  return a;
}

const {
  ActionMap,
  getActionMap,
  setActionMap
} = localRequire("@/server/lib/ActionMap.js");

/*
 *将文件信息统计到一个json文件中,
 * 由于静态文件没有命名空间来限制，那么就需要有优先级
 */
class StaticFileState {
  constructor() {

  }
  //多是异步的
  async init(staticStateList) {
    this.map = new ActionMap([], {});
    for (var i = 0; i < staticStateList.length; i++) {
      var map = new ActionMap(null, {});
      this.map.child[staticStateList[i].name.toLowerCase()] = map;
      await this.initOne(map, staticStateList[i].path);
    }
  }

  async initOne(map, root) {
    let allFile = await findAll(root);
    let ret = await this.setStatMap(map, root, allFile);
    return ret;
  }

  /**设置全部路由
   * */
  async setStatMap(map, root, allFile) {
    for (var i = 0; i < allFile.length; i++) {
      let file = allFile[i];
      let relative = toPath(file).replace(toPath(root), "");
      var stat = await this.getStat(file)
      setActionMap(map, relative, stat);
    }
  }



  /*获取单个文件的stat信息*/
  async getStat(file) {
    let ret = {}
    let awaitstat = await getStat(file);
    let extName = pt.extname(file);

    ret["Last-Modified"] = awaitstat.mtimeMs;
    ret["path"] = file;
    ret["ETag"] = awaitstat.mtimeMs + "-" + awaitstat.size;
    ret["size"] = awaitstat.size;
    ret["isDirectory"] = awaitstat.isDirectory();

    if (extName == ".html") {
      ret["Cache-Control"] = "no-cache";
    } else {
      //开发环境不需要缓存
      if (ENV == "product") {
        ret["Cache-Control"] = "only-if-cached";
      }
    }
    //允许js可以获取头部
    if (extName == ".js") {
      ret["Access-Control-Expose-Headers"] = "X-Client-Ip";
    }
    return ret;
  }


  /*更新单个文件的stat信息
   * realId /真实的跟路径的id
   * realRoot /真实的跟路径的根路径
   * updateFile 真实的跟路径
   * type
   * callback回调
   */
  get(url, callback, retObj) {
    return getActionMap(this.map, url, callback, retObj);
  }

  async getById(staticStateList, url) {
    let stat;
    for (let i = 0; i < staticStateList.length; i++) {
      let file = toPath(staticStateList[i].path + "/" + url)
      if (await exsits(file)) {
        let id = staticStateList[i].name.toLowerCase()
        this.map.child[id] = this.map.child[id] || new ActionMap(null, {});
        let relative = toPath(url);
        stat = await this.getStat(file)
        return setActionMap(this.map.child[id], relative, stat);
        //  getActionMap(this.map.child[id], url, null, true);
      }
    }
    if(this.map.value.length>400){//不超过400个对象，防止内存泄漏
      this.map.value = this.map.value.slice(200);
    }
    this.map.value = this.map.value || [];
    this.map.value.push(url);
  }


}

module.exports = StaticFileState

// global.ENV = process.argv[2] == "dev" ? "dev" : "product"
// var stat = new StaticFileState()
// stat.init([{ name: "rapserver", path: localRequire("@/server/static/dest", true) }]).then(() => {
//   console.log(stat)
// })