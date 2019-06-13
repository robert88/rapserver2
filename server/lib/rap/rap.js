
global.rap = global.rap||{};

require("./rap.debounce");
require("./rap.inputfileSystem");
require("./rap.fileSystem");
require("./rap.restful");		

const Log = require("./Log");

let log = new Log({filesystem:rap.cacheInputFileSystem,outpath:localRequire("@/sever/log",true)}).init();

["log", "warn", "info", "error"].forEach(()=>{
    rap[type] = function () {
        rap.debounce(log.save, 10000, "uuid-log-" + type, log.format(log, type, this[type].caller, arguments));
    }
});
	