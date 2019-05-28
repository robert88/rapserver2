require("../lib/global/global.localRequire");
localRequire("@/server/lib/rap/rap.cacheInputFileSystem.js");


const pt = require("path")

//stat
test(`rap cacheInputFileSystem api stat`, (done) => {
	var dir = pt.resolve(__dirname,"./readDir");

	rap.cacheInputFileSystem.stat(dir,function(data){

		expect(data.atime.constructor == Date).toBe(false);//目前测试发现不是Date的实例
		expect(typeof data.atime.getTime).toBe("function");
		expect(typeof data.atimeMs).toBe("number");
	
		expect(data.birthtime instanceof Date).toBe(false);
		expect(typeof data.birthtimeMs).toBe("number");
	
		expect(data.ctime instanceof Date).toBe(false);
		expect(typeof data.ctimeMs).toBe("number");

		expect(typeof data.dev).toBe("number");//包含该文件的设备的数字标识符。
		expect(typeof data.gid).toBe("number");//拥有该文件（POSIX）的群组的数字型群组标识符。
		expect(typeof data.ino).toBe("number");//文件系统特定的文件索引节点编号。
		expect(typeof data.mode).toBe("number");//描述文件类型和模式的位字段。
		expect(typeof data.nlink).toBe("number");//文件存在的硬链接数。
		expect(typeof data.rdev).toBe("number");//如果文件被视为特殊文件，则此值为数字型设备标识符。
		expect(typeof data.size).toBe("number");//文件的大小（以字节为单位）。
		expect(typeof data.uid).toBe("number");//拥有该文件（POSIX）的用户的数字型用户标识符。
		done();
	})

	let data = rap.cacheInputFileSystem.statSync(dir);


	expect(data.atime.constructor == Date).toBe(false);
	expect(typeof data.atime.getTime).toBe("function");
	expect(typeof data.atimeMs).toBe("number");

	expect(data.birthtime instanceof Date).toBe(false);
	expect(typeof data.birthtimeMs).toBe("number");

	expect(data.ctime instanceof Date).toBe(false);
	expect(typeof data.ctimeMs).toBe("number");

	expect(typeof data.dev).toBe("number");//包含该文件的设备的数字标识符。
	expect(typeof data.gid).toBe("number");//拥有该文件（POSIX）的群组的数字型群组标识符。
	expect(typeof data.ino).toBe("number");//文件系统特定的文件索引节点编号。
	expect(typeof data.mode).toBe("number");//描述文件类型和模式的位字段。
	expect(typeof data.nlink).toBe("number");//文件存在的硬链接数。
	expect(typeof data.rdev).toBe("number");//如果文件被视为特殊文件，则此值为数字型设备标识符。
	expect(typeof data.size).toBe("number");//文件的大小（以字节为单位）。
	expect(typeof data.uid).toBe("number");//拥有该文件（POSIX）的用户的数字型用户标识符。

});



//getSize
test(`rap cacheInputFileSystem api getSize`, (done) => {
	var dir = pt.resolve(__dirname,"./readDir");
	var dir2 = pt.resolve(__dirname,"./readDir/file4.json");
	let data = rap.cacheInputFileSystem.getSizeSync(dir);
	let data2 = rap.cacheInputFileSystem.getSizeSync(dir2);
	expect(data).toBe(0);
	//toBeLessThanOrEqual <=
	expect(data2).toBeLessThanOrEqual(1024);
	rap.cacheInputFileSystem.getSize(dir,data=>{
		expect(data).toBe(0);
		rap.cacheInputFileSystem.getSize(dir2,data=>{
			expect(data2).toBeLessThanOrEqual(1024);
			done();
		});
	});
});

//getModify
test(`rap cacheInputFileSystem api getModify`, (done) => {
	var dir = pt.resolve(__dirname,"./readDir");
	let data = rap.cacheInputFileSystem.getModifySync(dir);
	expect(data).toBe(1558763435000);
	rap.cacheInputFileSystem.getModify(dir,data=>{
		expect(data).toBe(1558763435000);
		done();
	});
});

//isDir
test(`rap cacheInputFileSystem api isDir`, (done) => {
	var dir = pt.resolve(__dirname,"./readDir");
	var dir2 = pt.resolve(__dirname,"./readDir1");//测试一个不存在的
	
	console.log("-----------jest will throw error but will pass","beause readDir1 is not exist!-----------")

	let data = rap.cacheInputFileSystem.isDirSync(dir);
	let data2 = rap.cacheInputFileSystem.isDirSync(dir2);
	expect(data).toBe(true);
	expect(data2).toBeUndefined();
	rap.cacheInputFileSystem.isDir(dir,data=>{
		expect(data).toBe(true);
		rap.cacheInputFileSystem.isDir(dir2,data=>{
			expect(1).toBe(2);//这个不会测到
		},()=>{
			done();
		});
	});
});

//isFile
test(`rap cacheInputFileSystem api isFile`, (done) => {
	var dir = pt.resolve(__dirname,"./readDir");
	var dir2 = pt.resolve(__dirname,"./readDir/file4.json");
	let data = rap.cacheInputFileSystem.isFileSync(dir);
	let data2 = rap.cacheInputFileSystem.isFileSync(dir2);
	expect(data).toBe(false);
	expect(data2).toBe(true);
	rap.cacheInputFileSystem.isFile(dir,data=>{
		expect(data).toBe(false);
		rap.cacheInputFileSystem.isFile(dir2,data=>{
			expect(data).toBe(true);
			done();
		});
	});
});

// exists
test(`rap cacheInputFileSystem api exists`, (done) => {
	var dir = pt.resolve(__dirname,"./readDir");
	var dir2 = pt.resolve(__dirname,"./readDir1");
	let data = rap.cacheInputFileSystem.existsSync(dir);
	let data2 = rap.cacheInputFileSystem.existsSync(dir2);
	expect(data).toBe(true);
	expect(data2).toBeUndefined();
	rap.cacheInputFileSystem.exists(dir,data=>{
		expect(data).toBe(true);
		rap.cacheInputFileSystem.exists(dir2,data=>{
			expect(1).toBe(2);//如果不存在，就不会调用
		},()=>{
			done();
		});
	});
});