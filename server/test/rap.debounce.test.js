//测试
require("../lib/rap.debounce");

//测试间隔
test('debounce intervel time', (done) => {
	// expect.assertions(1)
	let recordTime;
	let callFunction =(params,uuid)=>{
		if(recordTime){
			let intervel = +new Date()-recordTime;
			expect(intervel).toBeGreaterThan(999);
			done()
		}else{
			recordTime = +new Date();
		}
	}

	rap.debounce(callFunction,1000,"test intervel time","gaoxing2");
	rap.debounce(callFunction,1000,"test intervel time","gaoxingok3");
})

//测试调用次数
test('debounce call Count', (done) => {
	var jestFn = jest.fn();
	rap.debounce(jestFn,1000,"test Count","gaoxing2");
	rap.debounce(jestFn,1000,"test Count","gaoxingok3");
	rap.debounce(jestFn,1000,"test Count","gaoxingok3");
	rap.debounce(jestFn,1000,"test Count","gaoxingok3");
	rap.debounce(jestFn,1000,"test Count","gaoxingok3");
	setTimeout(()=>{
		rap.debounce(jestFn,1000,"test Count","gaoxingok3");
	},1000);
	setTimeout(()=>{
		expect(jestFn).toHaveBeenCalledTimes(3);
		done()
	},2000);
})

//测试参数
test('debounce params', (done) => {
	var jestFn = jest.fn();
	rap.debounce(jestFn,1000,"test params","gaoxing2");
	rap.debounce(jestFn,1000,"test params","gaoxingok3");
	rap.debounce(jestFn,1000,"test params","gaoxingok4");
	rap.debounce(jestFn,1000,"test params","gaoxingok5");
	rap.debounce(jestFn,1000,"test params","gaoxingok6");

	setTimeout(()=>{
		expect(jestFn).toHaveBeenNthCalledWith(1, ['gaoxing2'],"test params");
		expect(jestFn).toHaveBeenNthCalledWith(2, ['gaoxingok3',"gaoxingok4","gaoxingok5","gaoxingok6"],"test params");
		done()
	},2000);
})