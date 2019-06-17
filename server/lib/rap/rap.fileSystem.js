
global.rap = global.rap||{};

const CachedInputFileSystem = localRequire("@/server/lib/node_modules/enhanced-resolve/lib/FileSystemInput.js");
const CachedOutputFileSystem = localRequire("@/server/lib/node_modules/enhanced-resolve/lib/FileSystemOutput.js");

//定义5s以内的缓存

rap.fileSystem = {
    input:{
        noCache:new CachedInputFileSystem(null,true),
        cache:new CachedInputFileSystem(5000),
    },
    output:new CachedOutputFileSystem()
}