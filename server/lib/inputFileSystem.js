

//定义5s以内的缓存

const CachedInputFileSystem = require("./node_modules/enhanced-resolve/lib/CachedInputFileSystem.js");

const NodeJsInputFileSystem = require("./node_modules/enhanced-resolve/lib/NodeJsInputFileSystem.js");

module.exports = CachedInputFileSystem(new NodeJsInputFileSystem(),5000);