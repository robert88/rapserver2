require("../../lib/global/global.localRequire");

localRequire("@/server/lib/global/global.js");

localRequire("@/server/lib/rap/rap.js");

var parse = localRequire("@/server/build/compiler/parse.js");

var obj = parse.parseTree("div","<div id='1'><div id='2'></div><div id='3'></div></div>");

console.log(obj)