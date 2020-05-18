require("../../build/build.js");
// global.ENV = "product"
rap.build(localRequire("@/server/test/compiler/source/build.html", true), {
  watchDirs:[localRequire("@/server/test/compiler",true)]
});