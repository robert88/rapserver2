//测试
require("../lib/global/global.localRequire");
const Log = localRequire("@/server/lib/rap/Log");
localRequire("@/server/lib/rap/rap.cacheInputFileSystem.js");

var logPath = localRequire("@/server/test/log",true);
var fs = require("fs");
//测试间隔
test('class Log', (done) => {
 let log = new Log({filesystem:rap.cacheInputFileSystem,outpath:logPath}).init();
	log.save("ok",()=>{
		var stat = 	fs.statSync(logPath+"/"+log.active);
		expect(typeof stat).toBe("object");
		done();
	});

});
