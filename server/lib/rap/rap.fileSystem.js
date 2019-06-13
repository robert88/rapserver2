
global.rap = global.rap||{};

const CachedInputFileSystem = localRequire("@/server/lib/node_modules/enhanced-resolve/lib/CachedInputFileSystem.js");
const CachedOutputFileSystem = localRequire("@/server/lib/node_modules/enhanced-resolve/lib/CachedOutputFileSystem.js");

//定义5s以内的缓存

rap.fileSystem = {
    input:{
        noCache:new CachedInputFileSystem(null,true),
        cache:new CachedInputFileSystem(5000),
    },
    output:new CachedOutputFileSystem()
}