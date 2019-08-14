global.rap = global.rap || {};

require("../global/global.localRequire");

localRequire("@/server/lib/rap/rap.debounce.js");
localRequire("@/server/lib/rap/rap.system");
localRequire("@/server/lib/rap/rap.restful.js");

/*cmd*/
const Cmd = localRequire("@/server/lib/rap/Cmd.js");
rap.cmd = new Cmd(rap.system);

/***log***/
const Log = localRequire("@/server/lib/rap/Log.js");
let logPath = localRequire("@/server/log", true);
let log = new Log({system: rap.system,outpath: logPath});
rap.console = log.init(rap,function(type,fn){
  rap[type] = fn;
});

/****Archiver */
const Archiver = localRequire("@/server/lib/rap/Archiver.js");
rap.rar = new Archiver(rap.system,rap.cmd);
