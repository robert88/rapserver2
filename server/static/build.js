require("../build/build.js");
require("./resolve");

// global.ENV = "product";
global.ENV = "dev";

rap.build(rap.parse.input(__filename, "./src/html"), {
  watchDirs: [rap.parse.input(__filename, "./src")]
});