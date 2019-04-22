//测试
require("../lib/rap.inputFileSystem.js");
require("../lib/rap.cacheInputFileSystem.js");

const pt = require("path")

const CachedInputFileSystem = require("../lib/node_modules/enhanced-resolve/lib/CachedInputFileSystem");


//测试exist
test('rap cacheInputFileSystem exists', (done) => {
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
			expect(isExistTestTrue).toBe(true);
			expect(isExistTestFalse).toBe(false);
			expect(asyncExistTrue).toBe(true);
			expect(asyncExistFalse).toBe(false);
			done();
		}
	}
	let isExistTestTrue = rap.cacheInputFileSystem.existsSync(pt.resolve(__dirname,"../test"));
	let isExistTestFalse = rap.cacheInputFileSystem.existsSync("../test");
});

//必须提供以下api
test('rap cacheInputFileSystem api', () => {
	["readdir","stat","readFile","readlink","exists","readJson","readData","findFile","findDir","getSize","getModify","isDir","isFile"].forEach(type=>{
		console.log(type,typeof rap.cacheInputFileSystem[type])
		expect(typeof rap.cacheInputFileSystem[type]).toBe("function");
		expect(typeof rap.cacheInputFileSystem[type+"Sync"]).toBe("function");
	})
});

//必须提供以下api
test('rap cacheInputFileSystem cache', () => {
	var inputFileSystem = {};
	["readdir","stat","readFile","readlink","exists"].forEach(type=>{
		inputFileSystem[type] = jest.fn();
		inputFileSystem[type+"Sync"] = jest.fn();
	});
	var cacheInput = new CachedInputFileSystem(inputFileSystem);
	["readdir","stat","readFile","readlink","exists"].forEach(type=>{
		[1,2,3,4].forEach(()=>{
			cacheInput[type](pt.resolve(__dirname,"../test"),function(){
				expect(inputFileSystem[type]).toHaveBeenCalledTimes(1);
			});
			cacheInput[type](pt.resolve(__dirname,"../test"),function(){
				expect(inputFileSystem[type]).toHaveBeenCalledTimes(1);
			});
			cacheInput[type](pt.resolve(__dirname,"../test"),function(){
				expect(inputFileSystem[type]).toHaveBeenCalledTimes(1);
			});
			cacheInput[type](pt.resolve(__dirname,"../test"),function(){
				expect(inputFileSystem[type]).toHaveBeenCalledTimes(1);
			});
		});
	});
	//扩展的接口
	["readJson","readData","findFile","findDir","getSize","getModify","isDir","isFile"].forEach(type=>{
		[1,2,3,4].forEach(()=>{
			cacheInput[type](pt.resolve(__dirname,"../test"),function(){
				expect(inputFileSystem["readFile"]).toHaveBeenCalledTimes(0);
			});
			cacheInput[type](pt.resolve(__dirname,"../test"),function(){
				expect(inputFileSystem["readFile"]).toHaveBeenCalledTimes(0);
			});
			cacheInput[type](pt.resolve(__dirname,"../test"),function(){
				expect(inputFileSystem["readFile"]).toHaveBeenCalledTimes(0);
			});
			cacheInput[type](pt.resolve(__dirname,"../test"),function(){
				expect(inputFileSystem["readFile"]).toHaveBeenCalledTimes(1);
			});
		})
	});
	["findFile","findDir"].forEach(type=>{
		[1,2,3,4].forEach(()=>{
			cacheInput[type](pt.resolve(__dirname,"../test"),function(){
				expect(inputFileSystem["readdir"]).toHaveBeenCalledTimes(0);
			})
			cacheInput[type](pt.resolve(__dirname,"../test"),function(){
				expect(inputFileSystem["readdir"]).toHaveBeenCalledTimes(0);
			})
			cacheInput[type](pt.resolve(__dirname,"../test"),function(){
				expect(inputFileSystem["readdir"]).toHaveBeenCalledTimes(0);
			})
			cacheInput[type](pt.resolve(__dirname,"../test"),function(){
				expect(inputFileSystem["readdir"]).toHaveBeenCalledTimes(0);
			})
		})
	});

	["getSize","getModify","isDir","isFile"].forEach(type=>{
		[1,2,3,4].forEach(()=>{
			cacheInput[type](pt.resolve(__dirname,"../test"),function(){
				expect(inputFileSystem["stat"]).toHaveBeenCalledTimes(0);
			})
			cacheInput[type](pt.resolve(__dirname,"../test"),function(){
				expect(inputFileSystem["stat"]).toHaveBeenCalledTimes(0);
			})
			cacheInput[type](pt.resolve(__dirname,"../test"),function(){
				expect(inputFileSystem["stat"]).toHaveBeenCalledTimes(0);
			})
			cacheInput[type](pt.resolve(__dirname,"../test"),function(){
				expect(inputFileSystem["stat"]).toHaveBeenCalledTimes(0);
			})
		})
	});

})
