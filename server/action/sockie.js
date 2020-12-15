//action: /rapserver/sockie

var os = require("os");

var timer;

//cpu固定信息
function getCpuStruct(){
  var tempCpuInfo = os.cpus();
  return {stack:{timeStack:[],valueStack:[],memoryStack:[]},
	model:tempCpuInfo[0].model,
	count:tempCpuInfo.length,
	totalMem:os.totalmem(),
	speed:tempCpuInfo[0].speed
}
}

var g_cpuInfo = getCpuStruct();


//每隔1s更新一次cpu数据
function loopGetCpuInfo(){
  var perInfo = getCpuInfo();
  clearTimeout(timer)
  timer = 	setTimeout(function () {
        var {idle,total} = getCpuInfo();
        g_cpuInfo.idle = idle - perInfo.idle;
        g_cpuInfo.total = total - perInfo.total;
        g_cpuInfo.freeMem = os.freemem();
        g_cpuInfo.processMemory = process.memoryUsage();
        g_cpuInfo.heapTotal = process.heapTotal;
        g_cpuInfo.heapUsed = process.heapUsed;
        g_cpuInfo.processUsage = process.uptime()- perInfo.processUsage
        loopGetCpuInfo();
    },1000)
}
/**
 *  实时更新
* */
function getCpuInfo(){
	var total = 0;
	var idle = 0;
    os.cpus().forEach(function (info) {
        for(var key in info.times){
            total +=  info.times[key];
            if(key=="idle"){
                idle+= info.times[key];
            }
        }
    });

    return {
        'idle': idle,
        'total': total,
        "processUsage":process.uptime()
    };
}

loopGetCpuInfo();

exports = module.exports = {
  /**
   * 获得端口
   * */
  "port": function(req, res, next) {
    var run = this;
    next({port:run.sockie.port});
  },
  "cpuAndheap":function(req,res,next){
    if(res.rap.query&&res.rap.query.limit){
      if(res.rap.cookie["cpuAndheap"]){
        next({})
      }else{
        next(g_cpuInfo)
      }
		}
  }
}
Object.defineProperty("_destory",exports,{
  
    value: function(){
      clearTimeout(timer);
      g_cpuInfo = null;
      tempCpuInfo = null;
    },
    writable: false,
    enumerable:false
  
})