require("../lib/rap.cacheInputFileSystem.js");
require("../lib/rap.toPath.js");

const pt = require("path");
const system = rap.cacheInputFileSystem.getSystem();
//readdir
test(`rap cacheInputFileSystem readdir cache`, (done) => {
	var comp = 2;
	function checkEnd(){
	  comp--;
	  done();
	}
	var dir = pt.resolve(__dirname, "./readDir");
  
	system.readdir = jest.fn();
	system.readdirSync = jest.fn();
  
	rap.cacheInputFileSystem.readdirSync(dir);
	rap.cacheInputFileSystem.findDirSync(dir);
	rap.cacheInputFileSystem.findFileSync(dir);

	expect(system.readdirSync.mock.calls.length).toBe(1);

	setTimeout(function() {
		rap.cacheInputFileSystem.readdirSync(dir);
		rap.cacheInputFileSystem.findDirSync(dir);
		rap.cacheInputFileSystem.findFileSync(dir);
	  expect(system.readdirSync.mock.calls.length).toBe(2);
	  checkEnd();
	}, 6000);

	rap.cacheInputFileSystem.readdir(dir, function(data) {
	  rap.cacheInputFileSystem.findDir(dir, data => {
		rap.cacheInputFileSystem.findFile(dir, () => {
		  expect(system.readdir.mock.calls.length).toBe(0);
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
	var dir = pt.resolve(__dirname, "./readDir");
  
	system.readFile = jest.fn();
	system.readFileSync = jest.fn();
  
	rap.cacheInputFileSystem.readJsonSync(dir);
	rap.cacheInputFileSystem.readJsonSync(dir);
	rap.cacheInputFileSystem.readDataSync(dir);
	rap.cacheInputFileSystem.readFileSync(dir);
  
	expect(system.readFileSync.mock.calls.length).toBe(1);
  
	setTimeout(function() {
	  rap.cacheInputFileSystem.readJsonSync(dir);
	  rap.cacheInputFileSystem.readJsonSync(dir);
	  rap.cacheInputFileSystem.readDataSync(dir);
	  rap.cacheInputFileSystem.readFileSync(dir);
	  expect(system.readFileSync.mock.calls.length).toBe(2);
	  checkEnd();
	}, 6000)
  
	rap.cacheInputFileSystem.readFile(dir, function(data) {
	  rap.cacheInputFileSystem.readJson(dir, data => {
		rap.cacheInputFileSystem.readData(dir, () => {
		  expect(system.readFile.mock.calls.length).toBe(0);
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
	  var dir = pt.resolve(__dirname, "./readDir/file4.json");
	
	  system.stat = jest.fn();
	  system.statSync = jest.fn();
	
	  rap.cacheInputFileSystem.statSync(dir);
	  rap.cacheInputFileSystem.statSync(dir);
	  rap.cacheInputFileSystem.getSizeSync(dir);
	  rap.cacheInputFileSystem.getModifySync(dir);
	  rap.cacheInputFileSystem.isDirSync(dir);
	  rap.cacheInputFileSystem.existsSync(dir);
	  rap.cacheInputFileSystem.isFileSync(dir);
	  expect(system.statSync.mock.calls.length).toBe(1);
	
	  setTimeout(function() {
		rap.cacheInputFileSystem.statSync(dir);
		rap.cacheInputFileSystem.statSync(dir);
		rap.cacheInputFileSystem.getSize(dir);
		rap.cacheInputFileSystem.getModify(dir);
		rap.cacheInputFileSystem.isDirSync(dir);
		rap.cacheInputFileSystem.existsSync(dir);
		rap.cacheInputFileSystem.isFileSync(dir);
		expect(system.statSync.mock.calls.length).toBe(2);
		checkEnd()
	  }, 6000)
	
	  rap.cacheInputFileSystem.stat(dir, function(data) {
		rap.cacheInputFileSystem.stat(dir, data => {
		  rap.cacheInputFileSystem.getSize(dir, () => {
			rap.cacheInputFileSystem.getModify(dir, () => {
			  rap.cacheInputFileSystem.isDir(dir, () => {
				rap.cacheInputFileSystem.exists(dir, () => {
				  rap.cacheInputFileSystem.isFile(dir, () => {
					expect(system.stat.mock.calls.length).toBe(0);
					checkEnd()
				  });
				});
			  });
			});
		  });
		});
	  })
	
	});