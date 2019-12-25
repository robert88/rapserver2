require("../lib/global/global.localRequire");
localRequire("@/server/lib/rap/rap.system.js");
const toPath = localRequire("@/server/lib/node_modules/enhanced-resolve/lib/toPath.js");

const pt = require("path")

var apis = ["readdir", "stat", "readFile", "readlink", "exists", "readJson", "readData", "findFile", "findDir", "getSize", "getModify", "isDir", "isFile"];

const cacheInputFileSystem = rap.system.input;
const output = rap.system.output;
var dir = pt.resolve(__dirname, "./readDir/testReaddir");
output.writeSync(toPath(dir + "/deep1/deep2/file6.txt"),"")
output.writeSync(toPath(dir + "/deep1/file5.txt"),"LINE1\r\nLINE2\r\nLINE3\r\nLINE4")
output.writeSync(toPath(dir + "/file2.txt"),"LINE1\r\nLINE2\r\nLINE3\r\nLINE4")
output.writeSync(toPath(dir + "/file3.js"),"LINE1\r\nLINE2\r\nLINE3\r\nLINE4")
output.writeSync(toPath(dir + "/file4.json"),JSON.stringify({"testname":"robert"}))
//必须提供以下api
test('rap cacheInputFileSystem api', () => {
  apis.forEach(type => {
    expect(typeof cacheInputFileSystem[type]).toBe("function");
    expect(typeof cacheInputFileSystem[type + "Sync"]).toBe("function");
  })
});

//测试readdir操作，读取当前文件夹全部信息
test(`rap cacheInputFileSystem api readdir`, (done) => {


  cacheInputFileSystem.readdir(dir,function(err, data) {
    //toBe不能比较对象
    // expect(data).toBe(["deep1", "file2.txt", "file3.js"]);
    expect(data).toEqual(["deep1", "file2.txt", "file3.js", "file4.json"]);
    done();
  })
  var dataSync = cacheInputFileSystem.readdirSync(dir);
  expect(dataSync).toEqual(["deep1", "file2.txt", "file3.js", "file4.json"]);

});

//测试readdir操作，读取当前文件夹全部信息,可以深度调用
test(`rap cacheInputFileSystem api findDir`, (done) => {

  let data = cacheInputFileSystem.findDirSync(dir, "", true);
  expect(data).toEqual([
    toPath(dir + "/deep1"),
    toPath(dir + "/deep1/deep2")
  ]);
  cacheInputFileSystem.findDir(dir, true,null, (err, data) => {
    expect(data).toEqual([
      toPath(dir + "/deep1"),
      toPath(dir + "/deep1/deep2")
    ]);
    //过滤测试
    cacheInputFileSystem.findDir(dir, true, (file, isdirFlag) => {
      expect(isdirFlag).toBe(true);
      if (~file.indexOf("deep2")) {
        return true;
      }
    }, (err, data) => {
      expect(data).toEqual([
        toPath(dir + "/deep1/deep2")
      ]);
      done();
    });
  });
});

//测试findFile操作，读取当前文件夹全部信息
test(`rap cacheInputFileSystem api findFile`, (done) => {

  let data = cacheInputFileSystem.findFileSync(dir, "txt", true);
  expect(data).toEqual([
    toPath(dir + "/deep1/deep2/file6.txt"),
    toPath(dir + "/deep1/file5.txt"),
    toPath(dir + "/file2.txt")
  ]);
  cacheInputFileSystem.findFile(dir, true,null, (err, data) => {
    expect(data).toEqual([
      toPath(dir + "/file2.txt"),
      toPath(dir + "/file3.js"),
      toPath(dir + "/file4.json"),
      toPath(dir + "/deep1/file5.txt"),
      toPath(dir + "/deep1/deep2/file6.txt")
    ]);
    //过滤测试
    cacheInputFileSystem.findFile(dir, true, (file, isdirFlag) => {
      expect(isdirFlag).toBe(false);
      if (~file.indexOf("deep1")) {
        return true;
      }
    }, (err, data) => {
      expect(data).toEqual([
        toPath(dir + "/deep1/file5.txt"),
        toPath(dir + "/deep1/deep2/file6.txt")
      ]);
      done();
    });

  });


});

//测试findFile操作，读取当前文件夹全部信息
test(`rap cacheInputFileSystem api findAll`, (done) => {

  let data = cacheInputFileSystem.findAllSync(dir, "txt", true);
  expect(data).toEqual([
    toPath(dir + "/deep1/deep2/file6.txt"),
    toPath(dir + "/deep1/file5.txt"),
    toPath(dir + "/file2.txt")
  ]);
  cacheInputFileSystem.findAll(dir, true, (err, data) => {
    expect(data).toEqual([
      toPath(dir + "/deep1"),
      toPath(dir + "/file2.txt"),
      toPath(dir + "/file3.js"),
      toPath(dir + "/file4.json"),
      toPath(dir + "/deep1/deep2"),
      toPath(dir + "/deep1/file5.txt"),
      toPath(dir + "/deep1/deep2/file6.txt")
    ]);
    //过滤测试
    cacheInputFileSystem.findAll(dir, true, (file, isdirFlag) => {
      if (~file.indexOf("deep1")) {
        return true;
      }

    }, (err, data) => {
      expect(data).toEqual([
        toPath(dir + "/deep1"),
        toPath(dir + "/deep1/deep2"),
        toPath(dir + "/deep1/file5.txt"),
        toPath(dir + "/deep1/deep2/file6.txt")
      ]);
      done();
    });

  });


});