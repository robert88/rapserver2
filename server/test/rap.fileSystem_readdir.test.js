
require("../lib/rap.cacheInputFileSystem.js");
require("../lib/rap.toPath.js");

const pt = require("path")

var apis = ["readdir","stat","readFile","readlink","exists","readJson","readData","findFile","findDir","getSize","getModify","isDir","isFile"];

//必须提供以下api
test('rap cacheInputFileSystem api', () => {
	apis.forEach(type=>{
		expect(typeof rap.cacheInputFileSystem[type]).toBe("function");
		expect(typeof rap.cacheInputFileSystem[type+"Sync"]).toBe("function");
	})
});

//测试readdir操作，读取当前文件夹全部信息
test(`rap cacheInputFileSystem api readdir`, (done) => {
	var dir = pt.resolve(__dirname,"./readDir");

	rap.cacheInputFileSystem.readdir(dir,function(data){
		//toBe不能比较对象
		// expect(data).toBe(["deep1", "file2.txt", "file3.js"]);
		expect(data).toEqual(["deep1", "file2.txt", "file3.js","file4.json"]);
		done();
	})
	var dataSync = rap.cacheInputFileSystem.readdirSync(dir);
	expect(dataSync).toEqual(["deep1", "file2.txt", "file3.js","file4.json"]);

});

//测试readdir操作，读取当前文件夹全部信息,可以深度调用
test(`rap cacheInputFileSystem api findDir`, (done) => {
	var dir = pt.resolve(__dirname,"./readDir");
	let data = rap.cacheInputFileSystem.findDirSync(dir,"",true);
	expect(data).toEqual([rap.toPath(dir+"/deep1"),rap.toPath(dir+"/deep1/deep2")]);
	rap.cacheInputFileSystem.findDir(dir,true,data=>{
		expect(data).toEqual([rap.toPath(dir+"/deep1"),rap.toPath(dir+"/deep1/deep2")]);
		done();
	});
});

//测试findFile操作，读取当前文件夹全部信息
test(`rap cacheInputFileSystem api findFile`, (done) => {
	var dir = pt.resolve(__dirname,"./readDir");
	let data = rap.cacheInputFileSystem.findFileSync(dir,"txt",true);
	expect(data).toEqual([rap.toPath(dir+"/deep1/deep2/file.txt"),rap.toPath(dir+"/file2.txt")]);
	rap.cacheInputFileSystem.findFile(dir,true,data=>{
		expect(data).toEqual([rap.toPath(dir+"/file2.txt"),rap.toPath(dir+"/file3.js"),rap.toPath(dir+"/file4.json"),rap.toPath(dir+"/deep1/deep2/file.txt")]);
		done();
	});
});

