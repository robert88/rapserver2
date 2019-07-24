require("../lib/global/global.localRequire");
localRequire("@/server/lib/rap/rap.fileSystem.js");

const cacheInputFileSystem = rap.fileSystem.input.cache;

const pt = require("path")

//stat
test(`rap cacheInputFileSystem api stat`, (done) => {

	var dir = localRequire("@/server/test/readDir",true);

	cacheInputFileSystem.stat(dir,function(err,data){

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

	let data = cacheInputFileSystem.statSync(dir);


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
	var dir = localRequire("@/server/test/readDir",true);
	var dir2 = localRequire("@/server/test/readDir/testGetSize.json",true);
	let data = cacheInputFileSystem.getSizeSync(dir);
	let data2 = cacheInputFileSystem.getSizeSync(dir2);
	expect(data).toBe(0);
	//toBeLessThanOrEqual <=
	expect(data2).toBeLessThanOrEqual(1024);
	cacheInputFileSystem.getSize(dir,(err,data)=>{
		expect(data).toBe(0);
		cacheInputFileSystem.getSize(dir2,(err,data)=>{
			expect(data2).toBeLessThanOrEqual(1024);
			done();
		});
	});
});

//getModify
test(`rap cacheInputFileSystem api getModify`, (done) => {
    //最后修改时间20190719 8:56
    var dir = localRequire("@/server/test/readDir/testmodify.txt",true);

	cacheInputFileSystem.getModify(dir,(err,data)=>{
		expect(data).toBe(1563497806932);
		done();
    });
    
    let data = cacheInputFileSystem.getModifySync(dir);
	expect(data).toBe(1563497806932);
});

//isDir
test(`rap cacheInputFileSystem api isDir`, (done) => {
    var dir = localRequire("@/server/test/readDir",true);
    var dir2 = localRequire("@/server/test/readDir2",true);
	
    console.log("-----------jest will throw error but will pass","beause readDir1 is not exist!-----------")
    
    var jestFn = jest.fn();

    let data = cacheInputFileSystem.isDirSync(dir);
    let data2 
    try {
        data2 = cacheInputFileSystem.isDirSync(dir2);
    } catch (error) {
        jestFn(error.message)
    }

    expect(jestFn).toHaveBeenNthCalledWith(1,"ENOENT: no such file or directory, stat 'D:/yinming/code/rapserver2-master/server/test/readDir2'");

    expect(data).toBe(true);
    
    expect(data2).toBeUndefined();
    
	cacheInputFileSystem.isDir(dir,(err,data)=>{
		expect(data).toBe(true);
		cacheInputFileSystem.isDir(dir2,(err,data)=>{
            expect(err.message).toBe("ENOENT: no such file or directory, stat 'D:/yinming/code/rapserver2-master/server/test/readDir2'");
            done();
		});
	});
});

//isFile
test(`rap cacheInputFileSystem api isFile`, (done) => {
	var dir = localRequire("@/server/test/readDir",true);
	var dir2 = localRequire("@/server/test/readDir/testIsFile.json",true);
	let data = cacheInputFileSystem.isFileSync(dir);
	let data2 = cacheInputFileSystem.isFileSync(dir2);
	expect(data).toBe(false);
	expect(data2).toBe(true);
	cacheInputFileSystem.isFile(dir,(err,data)=>{
		expect(data).toBe(false);
		cacheInputFileSystem.isFile(dir2,(err,data)=>{
			expect(data).toBe(true);
			done();
		});
	});
});

// exists
test(`rap cacheInputFileSystem api exists`, (done) => {
    var dir = localRequire("@/server/test/readDir",true);
    var dir2 = localRequire("@/server/test/readDir2",true);
	let data = cacheInputFileSystem.existsSync(dir);
	let data2 = cacheInputFileSystem.existsSync(dir2);
	expect(data).toBe(true);
	expect(data2).toBe(false);
	cacheInputFileSystem.exists(dir,(err,data)=>{
		expect(data).toBe(true);
		cacheInputFileSystem.exists(dir2,(err,data)=>{
            expect(!err).toBe(true);
            done();
		});
	});
});