
global.rap = global.rap||{};

const CachedInputFileSystem = localRequire("@/server/lib/node_modules/enhanced-resolve/lib/CachedInputFileSystem.js");

//定义5s以内的缓存

rap.cacheInputFileSystem = new CachedInputFileSystem(5000);