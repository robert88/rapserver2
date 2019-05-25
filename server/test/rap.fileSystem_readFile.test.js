
require("../lib/rap.cacheInputFileSystem.js");
require("../lib/rap.toPath.js");

const pt = require("path")

var apis = ["readdir","stat","readFile","readlink","exists","readJson","readData","findFile","findDir","getSize","getModify","isDir","isFile"];

//readFile
test(`rap cacheInputFileSystem api readFile`, (done) => {
	var dir = pt.resolve(__dirname,"./readDir/file2.txt");

	rap.cacheInputFileSystem.readFile(dir,function(data){
		expect(data.toString("utf-8")).toBe("LINE1\r\nLINE2\r\nLINE3\r\nLINE4");
		done();
	})

	let data = rap.cacheInputFileSystem.readFileSync(dir);
	expect(data.toString("utf-8")).toBe("LINE1\r\nLINE2\r\nLINE3\r\nLINE4");

});

test(`rap cacheInputFileSystem api readData`, (done) => {
	var dir = pt.resolve(__dirname,"./readDir/file2.txt");

	rap.cacheInputFileSystem.readData(dir,function(data){
		expect(data).toBe("LINE1\r\nLINE2\r\nLINE3\r\nLINE4");
		done();
	})

	let data = rap.cacheInputFileSystem.readDataSync(dir);
	expect(data).toBe("LINE1\r\nLINE2\r\nLINE3\r\nLINE4");

});

test(`rap cacheInputFileSystem api readJson`, (done) => {
	var dir = pt.resolve(__dirname,"./readDir/file4.json");

	rap.cacheInputFileSystem.readJson(dir,function(data){
		expect(data).toEqual({"testname":"robert"});
		done();
	})

	let data = rap.cacheInputFileSystem.readJsonSync(dir);
	expect(data).toEqual({"testname":"robert"});

});