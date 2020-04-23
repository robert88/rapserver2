require("../../build/build.js");
global.ENV = "product"
rap.build(localRequire("@/server/test/compiler/source/build.html", true), {
  js: {
    group: { "base": { src:"./base.js" } }
  },
  css:{
      group:{
        "base": { src:"./base.css" } 
      }
  },
  watchDirs:[localRequire("@/server/test/compiler",true)]
});