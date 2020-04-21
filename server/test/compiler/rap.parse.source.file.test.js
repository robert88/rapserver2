require("../../lib/global/global.localRequire");

localRequire("@/server/lib/global/global.js");

localRequire("@/server/lib/rap/rap.js");

localRequire("@/server/build/compiler/rap.parse.js");

var pt = require("path");

var parentData = { __templateFile__: "test2.html" };

var parentRelativeWatch = {};

var unique = {};

var config = {}

var orgHTML = rap.parse.byHtmlFile(pt.resolve(__dirname, "./source/testFile.html"), config, parentData, parentRelativeWatch, unique)

rap.parse.handleFile(orgHTML,{templatePath:pt.resolve(__dirname, "./source/testFile.html")}).then(ret=>{
  console.log(ret)
})

