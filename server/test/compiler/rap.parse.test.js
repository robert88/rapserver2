require("../../lib/global/global.localRequire");

localRequire("@/server/lib/global/global.js");

localRequire("@/server/lib/rap/rap.js");

localRequire("@/server/build/compiler/rap.parse.js");

var pt = require("path");

var parentData={__templateFile__:"test2.html"};

var parentRelativeWatch = {};

var unique = {};

var config={}

var orgHTML = rap.parse.byHtmlFile(pt.resolve(__dirname,"./useTag.html"), config, parentData, parentRelativeWatch, unique)
console.log(orgHTML)