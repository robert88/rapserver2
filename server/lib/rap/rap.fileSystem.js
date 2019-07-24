
global.rap = global.rap||{};

const FileSystemInput = localRequire("@/server/lib/node_modules/enhanced-resolve/lib/FileSystemInput.js");
const FileSystemOutput = localRequire("@/server/lib/node_modules/enhanced-resolve/lib/FileSystemOutput.js");

//定义5s以内的缓存

rap.fileSystem = {
    input:{
        // noCache:new CachedInputFileSystem(null,true),
        cache:new FileSystemInput(5000),
    },
    // output:new FileSystemOutput()
}