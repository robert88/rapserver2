global.rap = global.rap || {};


module.exports = class Log {

	constructor(options) {
		this.dir = options.outp
		this.debounce = {};
		this.debounce.time = options.time || 10000;//每隔多少分钟写入一次
		this.dateFormat = {
			message: "yy/MM/dd hh:mm:ss", //消息中的时间格式
			filename: "yyMMdd_hhmmss" //文件名的时间格式
		}
		this.maxSize = options.maxSize || (50 * 1024 * 1024);//单个文件最大值为50M
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
		let log = this;

		["log", "warn", "info", "error"].forEach((type) => {
			log.initActive(type);
			rap[type] = function () {
				rap.debounce(log.save, log.debounce.time, "uuid-log-" + type, Log.format(log, type, this[type].caller, arguments));
			}
		});
	}

	/**
	 *@parameter： data是经过debounce加工之后的数据，data.params中收集了10s之内的日志消息
	*@result:  10的debounce时间已经结束，开始将多个message写入日志文件中，日志文件格式：type+日期+.log,当这个文件达到了100M就开始重新写入到新的activeTime文件中
	*
	* */
	save(params, uuid) {

		var type = uuid.replace("uuid-log-","");

		this.resolve(type, (err,filename)=> {

			var str = params.join("\n") + "\n";

			params = null;

			if(err){
				console.log("log not save ----s:".error,str,"----:e;");
				return;
			}

			// promise_wake.writeData(filename, str, true).then(function () {

			// });
		});
	}

	//得到日志文件路径
	resolve(type, callback) {

		this.active(type, (err, file) => {
			if (err) {
				callback(err);
				return;
			}
			callback(null,file);
		})

	}

	//得到正在使用的日志文件
	active(type,callback) {
		
		let file = this.dir + "/" + this[type].active;

		rap.cacheInputFileSystem.getSize(file, (err,size) => {
			if(err){
				callback(err);
				return;
			}

			//大于50M就分文件
			if (size > this.maxSize) {
				this[type].active = new Date().format(this.dateFormat.filename)+ "."+type;
			}
			callback(null,this.dir + "/" + this[type].active );
		})

	}

	initActive(type){
		//经过排序之后，按时间顺序从小到大排序
		var files = rap.cacheInputFileSystem.findFileSync(this.dir,type).sort();
		if(files.length!=0){
			this[type].active =   new Date().format(this.dateFormat.filename)+ "."+type;
		}else{		
			this[type].active =  pt.basename(files[files.length-1]);
		}
	}

}


