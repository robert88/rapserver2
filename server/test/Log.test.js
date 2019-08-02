//测试
require("../lib/global/global.localRequire");
localRequire("@/server/lib/rap/rap.js");

const Log = localRequire("@/server/lib/rap/Log.js");

var logPath = localRequire("@/server/test/log",true);

//重新定义路径
rap.console.dir = logPath;

rap.system.output.removeSync(logPath);

rap.console.maxSize = 1024;//1kb,1024个英文，516个中文

//rap.log
test('rap.Log', (done) => {
	let count = 0;
	let perFile;
	for(let i=0;i<1025;i++){
		rap.log("a",(file)=>{
			if(count==0){
				expect(i).toBe(0);
				perFile = file;
			}else{
				expect(file).toBe(perFile);
				rap.log("b",(file2)=>{
					expect(file2).not.toBe(perFile);
					done();
				})
				expect(i).toBe(0);
			}
			count++;
		});
	}
},110000);


// //rap.warn
test('rap.warn', (done) => {
	let count = 0;
	let perFile;
	for(let i=0;i<1025;i++){
		rap.warn("a",(file)=>{
			if(count==0){
				expect(i).toBe(0);
				perFile = file;
			}else{
				expect(file).toBe(perFile);
				rap.warn("b",(file2)=>{
					expect(file2).not.toBe(perFile);
					done();
				})
				expect(i).toBe(0);
			}
			count++;
		});
	}
},110000);

// //rap.error
test('rap.error', (done) => {
	let count = 0;
	let perFile;
	for(let i=0;i<1025;i++){
		rap.error("a",(file)=>{
			if(count==0){
				expect(i).toBe(0);
				perFile = file;
			}else{
				expect(file).toBe(perFile);
				rap.error("b",(file2)=>{
					expect(file2).not.toBe(perFile);
					done();
				})
				expect(i).toBe(0);
			}
			count++;
		});
	}
},110000);