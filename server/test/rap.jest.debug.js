const pt = require("path")
const jestPath = pt.resolve(process.env.APPDATA,"npm/node_modules/jest-cli/build/cli");

require(jestPath).run("./server/test/rap.pack.test.js",__dirname);
