global.rap = global.rap||{};

let defaultSettings;


["log", "warn", "info", "error"].forEach(function (type) {
    rap.debounce(mergePortalFunc,defaultSettings.debounce.time,"uuid-log-"+type,[stringifyParams(type,this[type].caller,arguments)]);
});



/**
 *@parameter： data是经过debounce加工之后的数据，data.params中收集了10s之内的日志消息
 *@result:  10的debounce时间已经结束，开始将多个message写入日志文件中，日志文件格式：type+日期+.log,当这个文件达到了100M就开始重新写入到新的activeTime文件中
 *
 * */
function mergeHandleFunc(params, type) {

	var file = defaultSettings.logPath +"/"+ type + getActiveTime(type) + ".log";

	var str = params.join("\n")+"\n";

	promise_wake.getFileSize(file, true).then(function (size) {

		//大于100M就分文件
		if (size > defaultSettings.maxLogSize) {

			// console.info("类型为", type, "的日志文件(" + file + ")的大小已经达到", Math.floor(defaultSettings.maxLogSize / 1024), "kb");
			//更新文件名
            setActiveTime(type);
		}

		promise_wake.writeData(file, str, true).then(function () {

			// console.log("[{0} file write success]".tpl(type));

		});

	});

}