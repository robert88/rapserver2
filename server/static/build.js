require("D:\\yinming\\code\\rapserver2-master/server/build/build.js");
require("./resolve");

// global.ENV = "product";
global.ENV = "dev";

rap.build(rap.parse.input(__filename, "./src/html"), {
  watchDirs: [rap.parse.input(__filename, "./src")]
});