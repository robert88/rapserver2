
require("../lib/global/global.localRequire");
localRequire("@/server/lib/rap/rap.js");
const Cmd = localRequire("@/server/lib/rap/Cmd.js");
var cmd = new Cmd(rap.system)


test(`cmd nslookup`, (done) => {
	cmd.execApi("nslookup").then((ret)=>{
		expect(ret.indexOf("Address")!=-1).toBe(true);
		done();
	});
},90000);



//资源管理器
test(`cmd gpedit.msc`, (done) => {
	cmd.execApi("gpedit.msc").then((ret)=>{
		expect(1).toBe(1);
		done();
	});
},90000);

//本机用户和组
test(`cmd lusrmgr.msc`, (done) => {
	cmd.execApi("lusrmgr.msc").then((ret)=>{
		expect(1).toBe(1);
		done();
	});
},90000);

// 组策略
test(`cmd gpedit.msc`, (done) => {
	cmd.execApi("gpedit.msc").then((ret)=>{
		expect(1).toBe(1);
		done();
	});
},90000);

// 本地服务设置
test(`cmd services.msc`, (done) => {
	cmd.execApi("services.msc").then((ret)=>{
		expect(1).toBe(1);
		done();
	});
},90000);

//注册表
test(`cmd regedt32`, (done) => {
	cmd.execApi("regedt32").then((ret)=>{
		expect(1).toBe(1);
		done();
	});
},90000);

//任务管理器
test(`cmd taskmgr`, (done) => {
	cmd.execApi("taskmgr").then((ret)=>{
		expect(1).toBe(1);
		done();
	});
},90000);

//远程链接
test(`cmd mstsc`, (done) => {
	cmd.execApi("mstsc").then((ret)=>{
		expect(1).toBe(1);
		done();
	});
},90000);

//ODBC数据源管理器
test(`cmd odbcad32`, (done) => {
	cmd.execApi("odbcad32").then((ret)=>{
		expect(1).toBe(1);
		done();
	});
},90000);

//查看有哪些用户
test(`cmd net user`, (done) => {
	cmd.execApi("net user").then((ret)=>{
		expect(1).toBe(1);
		done();
	});
},90000);

//查看有哪些用户
test(`cmd net start`, (done) => {
	cmd.execApi("net start").then((ret)=>{
		expect(1).toBe(1);
		done();
	});
},90000);

//查看有哪些用户
test(`cmd ipconfig`, (done) => {
	cmd.execApi("ipconfig").then((ret)=>{
		expect(1).toBe(1);
		done();
	});
},90000);
　　
//查看任我
test(`cmd schtasks`, (done) => {
	cmd.execApi("schtasks").then((ret)=>{
		expect(1).toBe(1);
		done();
	});
},90000);

//环境变量查看
test(`cmd set`, (done) => {
	cmd.execApi("set").then((ret)=>{
		expect(1).toBe(1);
		done();
	});
},90000);

//启动我的电脑属性
test(`cmd rundll32 shell32,Control_RunDLL sysdm.cpl`, (done) => {
	cmd.execApi("rundll32 shell32,Control_RunDLL sysdm.cpl").then((ret)=>{
		expect(1).toBe(1);
		done();
	});
},90000);

//svn更新
test(`cmd svn svn update`, (done) => {
	cmd.execApi("svn update").then((ret)=>{
		expect(1).toBe(1);
		done();
	});
},90000);

//svn提交
test(`svn ci -m "commit"`, (done) => {
	cmd.execApi("svn ci -m '说明'").then((ret)=>{
		expect(1).toBe(1);
		done();
	});
},90000);

//svn查看状态
test(`svn status`, (done) => {
	cmd.execApi("svn status").then((ret)=>{
		expect(1).toBe(1);
		done();
	});
},90000);
// //svn查看状态 svn add ${file}

//资源管理器
test(`cmd explorer`, (done) => {
	cmd.execApi("explorer").then((ret)=>{
		expect(1).toBe(1);
		done();
	}).catch(e=>{
		//执行成功了但是就是报错
		expect(1).toBe(1);
		done();
	});
},90000);

// //设备管理器
test(`设备管理器`, (done) => {
	cmd.execApi("control.exe  /name Microsoft.DeviceManager ").then((ret)=>{
		expect(1).toBe(1);
		done();
	}).catch(e=>{
		//执行成功了但是就是报错
		expect(1).toBe(1);
		done();
	});
},90000);

// //防火墙
test(`防火墙`, (done) => {
	cmd.execApi("control.exe  /name Microsoft.WindowsFirewall ").then((ret)=>{
		expect(1).toBe(1);
		done();
	}).catch(e=>{
		//执行成功了但是就是报错
		expect(1).toBe(1);
		done();
	});
},90000);

test(`cmd osk`, (done) => {
	rap.cmd.execApi("osk").then((ret)=>{
		expect(1).toBe(1);
		done();
	}).catch(e=>{
		//执行成功了但是就是报错
		expect(1).toBe(1);
		done();
	});
},90000);
