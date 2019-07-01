require("../lib/global/global.localRequire");
localRequire("@/server/lib/rap/rap.fileSystem.js");
const toPath = localRequire("@/server/lib/node_modules/enhanced-resolve/lib/toPath.js");

const pt = require("path")

var apis = ["readdir","stat","readFile","readlink","exists","readJson","readData","findFile","findDir","getSize","getModify","isDir","isFile"];

const cacheInputFileSystem = rap.fileSystem.input.cache;

//必须提供以下api
test('rap cacheInputFileSystem api', () => {
	apis.forEach(type=>{
		expect(typeof cacheInputFileSystem[type]).toBe("function");
		expect(typeof cacheInputFileSystem[type+"Sync"]).toBe("function");
	})
});

//测试readdir操作，读取当前文件夹全部信息
test(`rap cacheInputFileSystem api readdir`, (done) => {
	var dir = pt.resolve(__dirname,"./readDir");

	cacheInputFileSystem.readdir(dir,function(data){
		//toBe不能比较对象
		// expect(data).toBe(["deep1", "file2.txt", "file3.js"]);
		expect(data).toEqual(["deep1", "file2.txt", "file3.js","file4.json"]);
		done();
	})
	var dataSync = cacheInputFileSystem.readdirSync(dir);
	expect(dataSync).toEqual(["deep1", "file2.txt", "file3.js","file4.json"]);

});

//测试readdir操作，读取当前文件夹全部信息,可以深度调用
test(`rap cacheInputFileSystem api findDir`, (done) => {
	var dir = pt.resolve(__dirname,"./readDir");
	let data = cacheInputFileSystem.findDirSync(dir,"",true);
	expect(data).toEqual([toPath(dir+"/deep1"),toPath(dir+"/deep1/deep2")]);
	cacheInputFileSystem.findDir(dir,true,data=>{
		expect(data).toEqual([toPath(dir+"/deep1"),toPath(dir+"/deep1/deep2")]);
		done();
	});
});

//测试findFile操作，读取当前文件夹全部信息
test(`rap cacheInputFileSystem api findFile`, (done) => {
	var dir = pt.resolve(__dirname,"./readDir");
	let data = cacheInputFileSystem.findFileSync(dir,"txt",true);
	expect(data).toEqual([toPath(dir+"/deep1/deep2/file.txt"),toPath(dir+"/file2.txt")]);
	cacheInputFileSystem.findFile(dir,true,data=>{
		expect(data).toEqual([toPath(dir+"/file2.txt"),toPath(dir+"/file3.js"),toPath(dir+"/file4.json"),toPath(dir+"/deep1/deep2/file.txt")]);
		done();
	});
});

