const pt = require("path")
const jestPath = pt.resolve(process.env.APPDATA,"npm/node_modules/jest-cli/build/cli");

require(jestPath).run("./server/test/Runner.perform.test.js",__dirname);
