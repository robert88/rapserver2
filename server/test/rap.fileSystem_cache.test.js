require("../lib/global/global.localRequire");
var FileSystemInput = localRequire("@/server/lib/node_modules/enhanced-resolve/lib/FileSystemInput.js");
var FileSystemOutput = localRequire("@/server/lib/node_modules/enhanced-resolve/lib/FileSystemOutput.js");
const pt = require("path");
const cacheInputFileSystem = new FileSystemInput(5000);
const system = cacheInputFileSystem.getSystem();
const output = new FileSystemOutput(cacheInputFileSystem);
const fs = require("fs");
// readdir
test(`rap cacheInputFileSystem readdir cache`, (done) => {
	var comp = 2;
	function checkEnd(){
	  comp--;
	  done();
	}
	var dir = pt.resolve(__dirname, "./readDir");

  var readdir =  jest.fn();
  var readdirSync =     jest.fn();
  system.readdir = function(){
    readdir();
    return fs.readdir.apply(fs,arguments);
  }
  system.readdirSync = function(){
    readdirSync();
    return fs.readdirSync.apply(fs,arguments);
  }
  
	cacheInputFileSystem.readdirSync(dir);
	cacheInputFileSystem.findDirSync(dir);
	cacheInputFileSystem.findFileSync(dir);

	expect(readdirSync.mock.calls.length).toBe(1);

	setTimeout(function() {
		cacheInputFileSystem.readdirSync(dir);
		cacheInputFileSystem.findDirSync(dir);
		cacheInputFileSystem.findFileSync(dir);
	  expect(readdirSync.mock.calls.length).toBe(2);
	  checkEnd();
	}, 6000);

	cacheInputFileSystem.readdir(dir, function(data) {
	  cacheInputFileSystem.findDir(dir, data => {
		cacheInputFileSystem.findFile(dir, () => {
		  expect(readdir.mock.calls.length).toBe(0);
		  checkEnd();
		});
	  });
	})
  
  });

  //readFile
test(`rap cacheInputFileSystem readFile cache`, (done) => {
	var comp = 2;
	function checkEnd(){
	  comp--;
	  done();
	}
	var dir = pt.resolve(__dirname, "./readDir/testCache.txt");
	output.writeSync(dir,"LINE1\r\nLINE2\r\nLINE3\r\nLINE4");
  var readFile =  jest.fn();
  var readFileSync =     jest.fn();
  system.readFile = function(){
    readFile();
    return fs.readFile.apply(fs,arguments);
  }
  system.readFileSync = function(){
		readFileSync();
		//必须是文件
    return fs.readFileSync.apply(fs,arguments);
  }
	
	cacheInputFileSystem.readJsonSync(dir);
	cacheInputFileSystem.readJsonSync(dir);
	cacheInputFileSystem.readDataSync(dir);
	cacheInputFileSystem.readFileSync(dir);
  
	expect(readFileSync.mock.calls.length).toBe(1);
  
	setTimeout(function() {
	  cacheInputFileSystem.readJsonSync(dir);
	  cacheInputFileSystem.readJsonSync(dir);
	  cacheInputFileSystem.readDataSync(dir);
	  cacheInputFileSystem.readFileSync(dir);
	  expect(readFileSync.mock.calls.length).toBe(2);
	  checkEnd();
	}, 6000)
  
	cacheInputFileSystem.readFile(dir, function(data) {
	  cacheInputFileSystem.readJson(dir, data => {
		cacheInputFileSystem.readData(dir, () => {
		  expect(readFile.mock.calls.length).toBe(0);
		  checkEnd()
		});
	  });
	})
  
  });
  
  //stat
  test(`rap cacheInputFileSystem stat cache`, (done) => {
	var comp = 2;
	function checkEnd(){
	  comp--;
	  done();
	}
		var dir = pt.resolve(__dirname, "./readDir/testCache.txt");
		
		var stat =  jest.fn();
		var statSync =     jest.fn();
		system.stat = function(){
			stat();
			return fs.stat.apply(fs,arguments);
		}
		system.statSync = function(){
			statSync();
			return fs.statSync.apply(fs,arguments);
		}

	  cacheInputFileSystem.statSync(dir);
	  cacheInputFileSystem.statSync(dir);
	  cacheInputFileSystem.getSizeSync(dir);
	  cacheInputFileSystem.getModifySync(dir);
	  cacheInputFileSystem.isDirSync(dir);
	  cacheInputFileSystem.existsSync(dir);
	  cacheInputFileSystem.isFileSync(dir);
	  expect(statSync.mock.calls.length).toBe(1);
	
	  setTimeout(function() {
		cacheInputFileSystem.statSync(dir);
		cacheInputFileSystem.statSync(dir);
		cacheInputFileSystem.getSize(dir);
		cacheInputFileSystem.getModify(dir);
		cacheInputFileSystem.isDirSync(dir);
		cacheInputFileSystem.existsSync(dir);
		cacheInputFileSystem.isFileSync(dir);
		expect(statSync.mock.calls.length).toBe(2);
		checkEnd()
	  }, 6000)
	
	  cacheInputFileSystem.stat(dir, function(data) {
		cacheInputFileSystem.stat(dir, data => {
		  cacheInputFileSystem.getSize(dir, () => {
			cacheInputFileSystem.getModify(dir, () => {
			  cacheInputFileSystem.isDir(dir, () => {
				cacheInputFileSystem.exists(dir, () => {
				  cacheInputFileSystem.isFile(dir, () => {
					expect(stat.mock.calls.length).toBe(0);
					checkEnd()
				  });
				});
			  });
			});
		  });
		});
	  })
	
	});