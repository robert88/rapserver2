require("../lib/global/global.localRequire");
localRequire("@/server/lib/rap/rap.fileSystem.js");


const pt = require("path")

var apis = ["readdir","stat","readFile","readlink","exists","readJson","readData","findFile","findDir","getSize","getModify","isDir","isFile"];

const cacheInputFileSystem = rap.fileSystem.input.cache;

//readFile
test(`rap cacheInputFileSystem api readFile`, (done) => {
	var dir = pt.resolve(__dirname,"./readDir/testReadFile.txt");

	cacheInputFileSystem.readFile(dir,function(err,data){
		expect(data.toString("utf-8")).toBe("LINE1\r\nLINE2\r\nLINE3\r\nLINE4");
		done();
	})

	let data = cacheInputFileSystem.readFileSync(dir);
	expect(data.toString("utf-8")).toBe("LINE1\r\nLINE2\r\nLINE3\r\nLINE4");

});

test(`rap cacheInputFileSystem api readData`, (done) => {
	var dir = pt.resolve(__dirname,"./readDir/testReadFile.txt");

	cacheInputFileSystem.readData(dir,function(err,data){
		expect(data).toBe("LINE1\r\nLINE2\r\nLINE3\r\nLINE4");
		done();
	})

	let data = cacheInputFileSystem.readDataSync(dir);
	expect(data).toBe("LINE1\r\nLINE2\r\nLINE3\r\nLINE4");

});

test(`rap cacheInputFileSystem api readJson`, (done) => {
	var dir = pt.resolve(__dirname,"./readDir/testReadjson.json");

	cacheInputFileSystem.readJson(dir,function(err,data){
		expect(data).toEqual({"testname":"robert"});
		done();
	})

	let data = cacheInputFileSystem.readJsonSync(dir);
	expect(data).toEqual({"testname":"robert"});

});