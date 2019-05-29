//测试
require("../lib/global/global.localRequire");
const Runner = localRequire("@/server/bootstrap/Runner.js");
localRequire("@/server/lib/rap/rap.restful.js");
test("test empty http server",function(done){
	let run = new Runner();
	rap.restful({
		url:"http://localhost:3003",
		success:function(ret){
			expect(ret).toBe("helloworld");
			done();
		}
	})
})
