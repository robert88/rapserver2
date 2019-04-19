
global.rap = global.rap||{};

//定义5s以内的缓存

const CachedInputFileSystem = require("enhanced-resolve/lib/CachedInputFileSystem");

rap.cacheInputFileSystem = new CachedInputFileSystem(rap.inputFileSystem,5000);