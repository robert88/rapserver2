require("../lib/global/global.localRequire");
var FileSystemInput = localRequire("@/server/lib/node_modules/enhanced-resolve/lib/FileSystemInput.js");

const pt = require("path");
const cacheInputFileSystem = new FileSystemInput(5000);
const system = cacheInputFileSystem.getSystem();

const fs = require("fs");
//stat
test(`rap cacheInputFileSystem stat cache`, () => {

  var dir = pt.resolve(__dirname, "./readDir/testCache.txt");
  var stat =  jest.fn();
  var statSync =     jest.fn();
  system.stat = function(){
    stat();
    return fs.stat.apply(fs,arguments);
  }
  system.statSync = function(){
    statSync();
    return fs.statSync.apply(fs,arguments);
  }

  cacheInputFileSystem.statSync(dir);
  cacheInputFileSystem.statSync(dir);
  //清除
  cacheInputFileSystem.purge("stat");
  cacheInputFileSystem.getSizeSync(dir);
  cacheInputFileSystem.getSizeSync(dir);
  expect(statSync).toHaveBeenCalledTimes(2);

});