require("../lib/global/global.localRequire");
localRequire("@/server/lib/rap/rap.fileSystem.js");


const pt = require("path");

const cacheInputFileSystem = rap.fileSystem.input.cache;

const system = cacheInputFileSystem.getSystem();
// readdir
test(`rap cacheInputFileSystem readdir cache`, (done) => {
	var comp = 2;
	function checkEnd(){
	  comp--;
	  done();
	}
	var dir = pt.resolve(__dirname, "./readDir");
  
	system.readdir = jest.fn();
	system.readdirSync = jest.fn();
  
	cacheInputFileSystem.readdirSync(dir);
	cacheInputFileSystem.findDirSync(dir);
	cacheInputFileSystem.findFileSync(dir);

	expect(system.readdirSync.mock.calls.length).toBe(1);

	setTimeout(function() {
		cacheInputFileSystem.readdirSync(dir);
		cacheInputFileSystem.findDirSync(dir);
		cacheInputFileSystem.findFileSync(dir);
	  expect(system.readdirSync.mock.calls.length).toBe(2);
	  checkEnd();
	}, 6000);

	cacheInputFileSystem.readdir(dir, function(data) {
	  cacheInputFileSystem.findDir(dir, data => {
		cacheInputFileSystem.findFile(dir, () => {
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
	
	console.log("------------jest will throw error but will pass","beause readFile is overwrite!------------")
	
	cacheInputFileSystem.readJsonSync(dir);
	cacheInputFileSystem.readJsonSync(dir);
	cacheInputFileSystem.readDataSync(dir);
	cacheInputFileSystem.readFileSync(dir);
  
	expect(system.readFileSync.mock.calls.length).toBe(1);
  
	setTimeout(function() {
	  cacheInputFileSystem.readJsonSync(dir);
	  cacheInputFileSystem.readJsonSync(dir);
	  cacheInputFileSystem.readDataSync(dir);
	  cacheInputFileSystem.readFileSync(dir);
	  expect(system.readFileSync.mock.calls.length).toBe(2);
	  checkEnd();
	}, 6000)
  
	cacheInputFileSystem.readFile(dir, function(data) {
	  cacheInputFileSystem.readJson(dir, data => {
		cacheInputFileSystem.readData(dir, () => {
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
		
		console.log("-----------jest will throw error but will pass","beause stat is overwrite!-----------")
	
	  cacheInputFileSystem.statSync(dir);
	  cacheInputFileSystem.statSync(dir);
	  cacheInputFileSystem.getSizeSync(dir);
	  cacheInputFileSystem.getModifySync(dir);
	  cacheInputFileSystem.isDirSync(dir);
	  cacheInputFileSystem.existsSync(dir);
	  cacheInputFileSystem.isFileSync(dir);
	  expect(system.statSync.mock.calls.length).toBe(1);
	
	  setTimeout(function() {
		cacheInputFileSystem.statSync(dir);
		cacheInputFileSystem.statSync(dir);
		cacheInputFileSystem.getSize(dir);
		cacheInputFileSystem.getModify(dir);
		cacheInputFileSystem.isDirSync(dir);
		cacheInputFileSystem.existsSync(dir);
		cacheInputFileSystem.isFileSync(dir);
		expect(system.statSync.mock.calls.length).toBe(2);
		checkEnd()
	  }, 6000)
	
	  cacheInputFileSystem.stat(dir, function(data) {
		cacheInputFileSystem.stat(dir, data => {
		  cacheInputFileSystem.getSize(dir, () => {
			cacheInputFileSystem.getModify(dir, () => {
			  cacheInputFileSystem.isDir(dir, () => {
				cacheInputFileSystem.exists(dir, () => {
				  cacheInputFileSystem.isFile(dir, () => {
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