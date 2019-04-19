//测试
require("../lib/rap.inputFileSystem.js");
require("../lib/rap.cacheInputFileSystem.js");

// const CachedInputFileSystem = require("enhanced-resolve/lib/CachedInputFileSystem");

// rap.cacheInputFileSystem = new CachedInputFileSystem(rap.inputFileSystem,5000);

const pt = require("path");
//测试exist
// test('rap cacheInputFileSystem exists', (done) => {
	let asyncExist1,asyncExist2;
	let asyncExistTrue,asyncExistFalse;
	rap.cacheInputFileSystem.exists(pt.resolve(__dirname,"../test"),function(data){
		asyncExist1 = true;
		asyncExistTrue =data;
		doneComplete();
	})
	rap.cacheInputFileSystem.exists("../test",function(data){
		asyncExist2 = true;
		asyncExistFalse =data;
		doneComplete();
	})
	function doneComplete(){
	if(asyncExist1&&asyncExist2){
			// expect(isExistTestTrue).toBe(true);
			// expect(isExistTestFalse).toBe(false);
			// expect(asyncExistTrue).toBe(true);
			// expect(asyncExistFalse).toBe(false);
			// done();
			console.log(isExistTestTrue,isExistTestFalse,asyncExistTrue,asyncExistFalse);
		}
	}
	let isExistTestTrue = rap.cacheInputFileSystem.existsSync(pt.resolve(__dirname,"../test"));
	let isExistTestFalse = rap.cacheInputFileSystem.existsSync("../test");

// })
