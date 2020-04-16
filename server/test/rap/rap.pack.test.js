require("../lib/global/global.localRequire");
localRequire("@/server/lib/rap/rap.js");
const testPath = localRequire("@/server/test/testPack", true);
rap.system.output.writeSync(testPath + "/a.html")
rap.system.output.writeSync(testPath + "/b.html")
rap.system.output.writeSync(testPath + "/d.html")
var fillData =  Array(1500).fill().map(a => Math.random())
rap.system.output.writeSync(testPath + "/c.html",fillData.join(""))


rap.system.output.removeSync(testPath + "/a.rar")
test("pack file and dir with clear", (done) => {
  rap.rar.pack(testPath + "/a.html", testPath + "/a.rar", function(err, cmd) {
    expect(cmd).not.toBeUndefined();
	expect(err).toBeNull();
	expect(rap.system.input.existsSync(testPath + "/a.rar")).toBe(true);
	rap.rar.pack(testPath + "/b.html", testPath + "/a.rar",{clear:true}, function(err, cmd) {
		expect(cmd).not.toBeUndefined();
		var ex = rap.system.input.existsSync(testPath + "/b.html")
		expect(ex).toBe(false);
		expect(err).toBeNull();
		done();
	  })
  });
},10000);

test("pack spilt", (done) => {
	rap.system.output.removeSync(testPath + "/b.rar")
	rap.system.output.removeSync(testPath + "/b.part1.rar")
	rap.system.output.removeSync(testPath + "/b.part2.rar")
	rap.rar.pack(testPath + "/c.html", testPath + "/b.rar", {splitSize:11},function(err, cmd) {
	  expect(cmd).not.toBeUndefined();
	  expect(err).toBeNull();
	  expect(rap.system.input.existsSync(testPath + "/b.part1.rar")).toBe(true);
	  expect(rap.system.input.existsSync(testPath + "/b.part2.rar")).toBe(true);
	  done()
	})
  },10000);

  
test("unpack", (done) => {
	rap.system.output.removeSync(testPath + "/c.rar");
	rap.system.output.removeSync(testPath + "/unpack");
	rap.rar.pack(testPath + "/d.html", testPath + "/c.rar",{relative:testPath}, function(err, cmd) {
	  expect(cmd).not.toBeUndefined();
	  expect(err).toBeNull();
	  expect(rap.system.input.existsSync(testPath + "/c.rar")).toBe(true);
	  rap.rar.unpack( testPath + "/c.rar", testPath + "/unpack",(err,cmd)=>{
		expect(rap.system.input.existsSync(testPath + "/unpack/d.html")).toBe(true);
		done();
	  })
	})
  },100000);
