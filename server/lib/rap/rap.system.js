
global.rap = global.rap||{};

const FileSystemInput = localRequire("@/server/lib/node_modules/enhanced-resolve/lib/FileSystemInput.js");
 const FileSystemOutput = localRequire("@/server/lib/node_modules/enhanced-resolve/lib/FileSystemOutput.js");

//定义5s以内的缓存

rap.system = {};

rap.system.input = new FileSystemInput(5000);
rap.system.output = new FileSystemOutput(rap.system.input);