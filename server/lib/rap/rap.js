
global.rap = global.rap||{};

require("../global/global.localRequire");

localRequire("@/server/lib/rap/rap.debounce.js");
localRequire("@/server/lib/rap/rap.fileSystem");
localRequire("@/server/lib/rap/rap.restful.js");		

const Log = localRequire("@/server/lib/rap/Log.js");

let log = new Log({filesystem:rap.cacheInputFileSystem,outpath:localRequire("@/sever/log",true)}).init();

["log", "warn", "info", "error"].forEach(()=>{
    rap[type] = function () {
        rap.debounce(log.save, 10000, "uuid-log-" + type, log.format(log, type, this[type].caller, arguments));
    }
});
	