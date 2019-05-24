
global.rap = global.rap||{};

const NodeJsInputFileSystem = require("enhanced-resolve/lib/NodeJsInputFileSystem");


rap.inputFileSystem = new NodeJsInputFileSystem();

//定义5s以内的缓存

rap.cacheInputFileSystem = new CachedInputFileSystem(rap.inputFileSystem,5000);