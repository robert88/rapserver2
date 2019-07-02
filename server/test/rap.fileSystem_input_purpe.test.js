require("../lib/global/global.localRequire");
localRequire("@/server/lib/rap/rap.fileSystem.js");

const pt = require("path");

const cacheInputFileSystem = rap.fileSystem.input.cache;

const system = cacheInputFileSystem.getSystem();

//stat
test(`rap cacheInputFileSystem stat cache`, (done) => {

  var dir = pt.resolve(__dirname, "./readDir/file4.json");

  system.stat = jest.fn();
  system.statSync = jest.fn();

  console.log("-----------jest will throw error but will pass", "beause stat is overwrite!-----------")

  cacheInputFileSystem.statSync(dir);
  cacheInputFileSystem.statSync(dir);
  cacheInputFileSystem.purpe("stat", dir);
  cacheInputFileSystem.getSizeSync(dir);
  cacheInputFileSystem.getSizeSync(dir);
  expect(system.statSync.mock.calls.length).toBe(2);

});