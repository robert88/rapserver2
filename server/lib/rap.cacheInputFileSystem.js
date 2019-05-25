
global.rap = global.rap||{};

const CachedInputFileSystem = require("enhanced-resolve/lib/CachedInputFileSystem");

//定义5s以内的缓存

rap.cacheInputFileSystem = new CachedInputFileSystem(5000);