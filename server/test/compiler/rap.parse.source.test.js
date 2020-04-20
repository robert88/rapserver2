require("../../lib/global/global.localRequire");

localRequire("@/server/lib/global/global.js");

localRequire("@/server/lib/rap/rap.js");

localRequire("@/server/build/compiler/rap.parse.js");

var pt = require("path");

var parentData = { __templateFile__: "test2.html" };

var parentRelativeWatch = {};

var unique = {};

var config = {}

var orgHTML = rap.parse.byHtmlFile(pt.resolve(__dirname, "./source/testjs.html"), config, parentData, parentRelativeWatch, unique)

 rap.parse.handleJs(orgHTML, {
  code: {
    templatePath:pt.resolve(__dirname, "./source/testjs.html"),
    group: {
      'base.js': { src: "./base.js", location: "head" }
    }
  }

}).then(ret=>{
    console.log(ret)
})

