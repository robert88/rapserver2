
global.rap = global.rap||{};

const NodeJsInputFileSystem = require("enhanced-resolve/lib/NodeJsInputFileSystem");


rap.inputFileSystem = new NodeJsInputFileSystem();

//����5s���ڵĻ���

rap.cacheInputFileSystem = new CachedInputFileSystem(rap.inputFileSystem,5000);