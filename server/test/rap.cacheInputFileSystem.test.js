//测试
require("../lib/rap.inputFileSystem.js");
require("../lib/rap.cacheInputFileSystem.js");

const pt = require("path")

const CachedInputFileSystem = require("../lib/node_modules/enhanced-resolve/lib/CachedInputFileSystem");

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

	rap.cacheInputFileSystem.readdir(dir,function(err,data){
		//toBe不能比较对象
		// expect(data).toBe(["deep1", "file2.txt", "file3.js"]);
		expect(data).toEqual(["deep1", "file2.txt", "file3.js"]);
		done();
	})
	var dataSync = rap.cacheInputFileSystem.readdirSync(dir);
	expect(dataSync).toEqual(["deep1", "file2.txt", "file3.js"]);

});



//测试readdir操作，读取当前文件夹全部信息
test(`rap cacheInputFileSystem api findDir`, (done) => {
	var dir = pt.resolve(__dirname,"./readDir");

	rap.cacheInputFileSystem.findDirSync(dir,function(err,data){
		expect(data).toEqual(["deep1"]);
		done();
	});
});


// //测试exists操作,测试文件是否存在
// test(`rap cacheInputFileSystem api exists`, (done) => {
// 	let asyncExist1,asyncExist2;
// 	let asyncExistTrue,asyncExistFalse;
// 	rap.cacheInputFileSystem.exists(pt.resolve(__dirname,"../test"),function(data){
// 		asyncExist1 = true;
// 		asyncExistTrue =data;
// 		doneComplete();
// 	})
// 	rap.cacheInputFileSystem.exists("../test",function(data){
// 		asyncExist2 = true;
// 		asyncExistFalse =data;
// 		doneComplete();
// 	})
// 	function doneComplete(){
// 	if(asyncExist1&&asyncExist2){
// 			expect(isExistTestTrue).toBe(true);
// 			expect(isExistTestFalse).toBe(false);
// 			expect(asyncExistTrue).toBe(true);
// 			expect(asyncExistFalse).toBe(false);
// 			done();
// 		}
// 	}
// 	let isExistTestTrue = rap.cacheInputFileSystem.existsSync(pt.resolve(__dirname,"../test"));
// 	let isExistTestFalse = rap.cacheInputFileSystem.existsSync("../test");
// });


