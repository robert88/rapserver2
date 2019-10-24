
// 命令vue ui
const pt = require("path")
//全局安装vue-cli之后全局目录下有vue.cmd
const jestPath = pt.resolve(process.env.APPDATA,"npm/node_modules/@vue/cli/bin/vue.js");
process.argv.push("ui");
require(jestPath)
