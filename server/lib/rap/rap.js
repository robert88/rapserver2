global.rap = global.rap || {};

require("../global/global.localRequire");

localRequire("@/server/lib/rap/rap.debounce.js");
localRequire("@/server/lib/rap/rap.system");
localRequire("@/server/lib/rap/rap.restful.js");

/*cmd*/
const Cmd = localRequire("@/server/lib/rap/Cmd.js");
let cmd = new Cmd();
rap.exec = cmd.execApi;

/***log***/
const Log = localRequire("@/server/lib/rap/Log.js");
let logPath = localRequire("@/server/log", true);
let log = new Log({system: rap.system,outpath: logPath});
rap.console = log.init(rap,function(type,fn){
  rap[type] = fn;
});

/****Archiver */
const Archiver = localRequire("@/server/lib/rap/Archiver.js");
let archive = new Archiver(rap.system,rap.exec);
rap.pack = archive.pack.bind(archive);
rap.unpack = archive.unpack.bind(archive);
