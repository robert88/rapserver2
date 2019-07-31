
global.rap = global.rap||{};

const FileSystemInput = localRequire("@/server/lib/node_modules/enhanced-resolve/lib/FileSystemInput.js");
 const FileSystemOutput = localRequire("@/server/lib/node_modules/enhanced-resolve/lib/FileSystemOutput.js");

//定义5s以内的缓存

rap.fileSystem = {};

rap.fileSystem.input = new FileSystemInput(5000);
 rap.fileSystem.output = new FileSystemOutput(rap.fileSystem.input);