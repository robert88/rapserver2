const pt =require("path");
/*
 *将文件信息统计到一个json文件中
 */
class StaticFileState {
  constructor(staticPathMap, system, jsonDir, log) {
    this.staticStateMap = {};
    this.system = system;
    this.jsonDir = jsonDir;
    this.log = log || { warn: function() {} }
    if (!staticPathMap) {
      this.log.warn("warning not find static file path");
      return;
    }
    for (let id in staticPathMap) {
      let stateMap = {};
      let allFile = this.system.input.findFileSync(staticPathMap[id], null, true) //wake.findFile(pathMap[id],null,true);
      allFile.forEach(file => {
        let relativefile = file.replace(staticPathMap[id], '');
        stateMap[relativefile] = this.getStat(file);
      })
      let jsonFile = jsonDir + "/" + id + ".json";
      this.system.output.writeSync(jsonFile, JSON.stringify({ root: staticPathMap[id], map: stateMap }))
      this.system.input.purge("all", jsonFile);
    }
  }

  /*获取单个文件的stat信息*/
  getStat(file) {
    let stat = {};
    let statInfo = this.system.input.statSync(file);
    stat["Last-Modified"] = statInfo.mtimeMs;
    stat["ETag"] = stat["Last-Modified"] + "-" + statInfo.size;
    stat["size"] = statInfo.size;
    var extName = pt.extname(file);
    if (extName == ".html") {
      stat["Cache-Control"] = "no-cache";
    }
    if (/(jpg)|(ppt)|(doc)|(ico)|(gif)|(png)|(mp3)|(mp4)|(wav)/.test(extName)) {
      stat["Content-Length"] = statInfo.size;
    }
    //允许js可以获取头部
    if (extName == ".js") {
      stat["Access-Control-Expose-Headers"] = "X-Client-Ip";
    }
    return stat;
  }
  getStatFile(realId,realRoot,updateFile){

    if (!updateFile) {
      this.log.warn("warning not find real file path",updateFile);
      return;
    }

    if (!realId) {
      this.log.warn("warning not find real file root id", realId);
      return;
    }

    if (!realRoot) {
      this.log.warn("warning not find real file root path", realRoot);
      return;
    }
    return this.jsonDir + "/" + realId + ".json";
    
  }

  /*更新单个文件的stat信息*/
  readOrUpdate(realId,realRoot,updateFile,type, callback) {

    var jsonFile =   this.getStatFile(realId,realRoot,updateFile);

    if(!jsonFile){
      callback(new Error("not find cache file"));
      return;
    }

    this.system.input.readJson(jsonFile, (err, data) => {
      if (err) {
        data = {map:{},root:realRoot};
      }
      let relativefile = updateFile.replace(realRoot, '');
      //获取信息
      if(type=="update"){
        this.system.input.purge("stat", updateFile);
        data.map[relativefile] = this.getStat(updateFile);
        this.system.output.writeSync(jsonFile, JSON.stringify(data))
        this.system.input.purge("all", jsonFile);
      }
      callback(null, data.map[relativefile]);
      data = null;

    })
  }

}

module.exports = StaticFileState