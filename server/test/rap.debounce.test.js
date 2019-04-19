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

	rap.debounce(callFunction,1000,"test intervel time","intervel params1");
	rap.debounce(callFunction,1000,"test intervel time","intervel params2");
})

//测试调用次数
test('debounce call Count', (done) => {
	var jestFn = jest.fn();
	rap.debounce(jestFn,1000,"test Count","Count params1");
	rap.debounce(jestFn,1000,"test Count","Count params2");
	rap.debounce(jestFn,1000,"test Count","Count params3");
	rap.debounce(jestFn,1000,"test Count","Count params4");
	rap.debounce(jestFn,1000,"test Count","Count params5");
	setTimeout(()=>{
		rap.debounce(jestFn,1000,"test Count","Count params6");
	},1000);
	setTimeout(()=>{
		expect(jestFn).toHaveBeenCalledTimes(3);
		done()
	},2000);
})

//测试参数
test('debounce params', (done) => {
	var jestFn = jest.fn();
	rap.debounce(jestFn,1000,"test params","params1");
	rap.debounce(jestFn,1000,"test params","params2");
	rap.debounce(jestFn,1000,"test params","params3");
	rap.debounce(jestFn,1000,"test params","params4");
	rap.debounce(jestFn,1000,"test params","params5");

	setTimeout(()=>{
		expect(jestFn).toHaveBeenNthCalledWith(1, ['params1'],"test params");
		expect(jestFn).toHaveBeenNthCalledWith(2, ['params2',"params3","params4","params5"],"test params");
		done()
	},2000);
})