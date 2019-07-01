//测试
require("../lib/global/global.localRequire");
const Log = localRequire("@/server/lib/rap/Log");
localRequire("@/server/lib/rap/rap.fileSystem.js");

var logPath = localRequire("@/server/test/log",true);
var fs = require("fs");
const cacheInputFileSystem = rap.fileSystem.input.cache;
//测试间隔
test('class Log', (done) => {
 let log = new Log({filesystem:cacheInputFileSystem,outpath:logPath}).init();
	log.save("test string",()=>{
		var data = fs.readFileSync(logPath+"/"+log.active).toString("utf-8")
		expect(data).toBe("test string");
		fs.readFileSync(logPath+"/"+log.active)
		done();
	});

});
