global.rap = global.rap || {};

const pt = require("path");

localRequire("@/server/lib/global/extention.Date.js");

module.exports = class Log {

	constructor(options) {
		this.dir = options.outpath
		this.inputFileSystem = options.inputFileSystem||{findFileSync:function(){},getSize:function(){}};
		this.outputFileSystem = options.outputFileSystem||{findFileSync:function(){},getSize:function(){}};
		this.dateFormat = {
			message: "yy/MM/dd hh:mm:ss", //消息中的时间格式
			filename: "yyMMdd_hhmmss" //文件名的时间格式
		}
		this.maxSize = options.maxSize || (3 * 1024 * 1024);//单个文件最大值为3M
		this.maxNumber = options.maxNumber || 10;
		this.zipWorkTime = {
			timeout: [0, 8, 12, 18],//打包监听的时间段
			clear: [0]//每周一（0）清除一次日志文件，会保留100M之内的当前文件
		}
	}

	//格式化-将参数序列化
	static format(log, type, caller, callerParams) {
		var callerParamsStr = String.stringify(callerParams)
		var callerName = "";
		var ret;
		caller && caller.toString().replace(/^function[^\{]+/ig, function (m) {
			callerName = m;
		});
		//将参数解析出来
		ret = "[{0}][{1}][{2}]:{3}".tpl(type, new Date().format(log.dateFormat.message), callerName, callerParamsStr);
		if (type == "error") {
			console.log("<<write log:\n".error + ret + "\nend log>>".error);
		}
		return ret;
	}

	//添加全局的log变量
	init() {
		["log", "warn", "info", "error"].forEach((type) => {
			this.initActive(type);
		});
		return this;
	}

	/**

	*
	* */
	save(message,type,callback) {

		this.getActive(type, (filename)=> {

			if(typeof message == "object" && message.join){
				message = params.join("\n") + "\n";
			}
			this.outputFileSystem.appendData()

		});
	}



	//得到正在使用的日志文件
	getActive(type,callback) {
		
		let file = this.dir + "/" + this[type].active;

		this.filesystem.getSize(file, (size) => {
			//分文件
			if (size > this.maxSize) {
				this[type].active = new Date().format(this.dateFormat.filename)+ "."+type;
			}
			callback(null,this.dir + "/" + this[type].active );
		},err=>{

		})

	}
	//获取当前写文件名
	initActive(type){
		//经过排序之后，按时间顺序从小到大排序,filesystem必须提供findFileSync
		var files = this.filesystem.findFileSync(this.dir,type);
		this[type] = this[type]||{};
		if(!files || files.length==0){
			this[type].active =   new Date().format(this.dateFormat.filename)+ "."+type;
		}else{		
			files = files.sort();
			this[type].active =  pt.basename(files[files.length-1]);
		}
	}

}


