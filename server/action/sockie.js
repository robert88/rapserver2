//action: /rapserver/sockie

var os = require("os");

var timer;

//cpu固定信息
function getCpuStruct() {
  var tempCpuInfo = os.cpus();
  return {
    processCpuStack: [],
    processMemoryStack: [],
    timeStack: [],
    cpuStack: [],
    memoryStack: [],
    model: tempCpuInfo[0].model,
    count: tempCpuInfo.length,
    totalMem: os.totalmem(),
    speed: tempCpuInfo[0].speed
  }
}

var g_cpuInfo = getCpuStruct();

//属性累加
function addAttr(obj) {
  var total = 0;
  for (var key in obj) {
    total += obj[key];
  }
  return total;
}

//100整数百分比
function precent(val) {
  return Math.floor(val * 100);
}

//每隔1s更新一次cpu数据
function loopGetCpuInfo() {
  var perInfo = getCpuInfo();
  var perProcessUsage = process.cpuUsage();
  clearTimeout(timer)
  timer = setTimeout(function() {
    var { idle, total } = getCpuInfo();
    g_cpuInfo.idle = idle - perInfo.idle;
    g_cpuInfo.total = total - perInfo.total;
    g_cpuInfo.freeMem = os.freemem(); //bytes.
    var processCpu = addAttr(process.cpuUsage(perProcessUsage)); //us=0.000001s

    var processMemory = addAttr(process.memoryUsage()); //v8+external + C++ and JavaScript objects and code  ArrayBuffers and SharedArrayBuffers, including all Node.js Buffers.

    g_cpuInfo.processMemoryStack.push((processMemory / os.totalmem()*100).toFixed(2));
    g_cpuInfo.processCpuStack.push((processCpu / 1000 / 1000 *100).toFixed(2)); //占有时间/1000ms /定时器时间
    g_cpuInfo.timeStack.push(new Date().format("yy/MM/dd hh:mm:ss"));
    g_cpuInfo.cpuStack.push(100 - precent(g_cpuInfo.idle / g_cpuInfo.total));
    g_cpuInfo.memoryStack.push(100 - precent( g_cpuInfo.freeMem / g_cpuInfo.totalMem) )

    if (g_cpuInfo.timeStack.length > 360) { //240s
      g_cpuInfo.processMemoryStack = g_cpuInfo.processMemoryStack.slice(-240);
      g_cpuInfo.processCpuStack = g_cpuInfo.processCpuStack.slice(-240);
      g_cpuInfo.timeStack = g_cpuInfo.timeStack.slice(-240);
      g_cpuInfo.cpuStack = g_cpuInfo.cpuStack.slice(-240);
      g_cpuInfo.memoryStack = g_cpuInfo.memoryStack.slice(-240);
    }

    loopGetCpuInfo();
  }, 1000)
}
/**
 *  实时更新
 * */
function getCpuInfo() {
  var total = 0;
  var idle = 0;
  os.cpus().forEach(function(info) {
    for (var key in info.times) {
      total += info.times[key];
      if (key == "idle") {
        idle += info.times[key];
      }
    }
  });

  return {
    'idle': idle,
    'total': total
  };
}

loopGetCpuInfo();

exports = module.exports = {
  /**
   * 获得端口
   * */
  "port": function(req, res, next) {
    var run = this;
    next({ port: run.sockie.port });
  },
  "cpuAndheap": function(req, res, next) {
    let limit = res.rap.query && res.rap.query.limit || 1;
    let all = res.rap.query && res.rap.query.all || 1;
    let ret = {
      timeStack: g_cpuInfo.timeStack.slice(-limit),
      cpuStack: g_cpuInfo.cpuStack.slice(-limit),
      memoryStack: g_cpuInfo.memoryStack.slice(-limit),
      freeMem: g_cpuInfo.freeMem
    }
    //以下参数是固定参数
    if (all) {
      ret.model = g_cpuInfo.model;
      ret.speed = g_cpuInfo.speed;
      ret.count = g_cpuInfo.count;
      ret.totalMem = g_cpuInfo.totalMem;
    }
    next(ret);

  }
}
Object.defineProperty(exports, "_destory", {
  value: function() {
    clearTimeout(timer);
    g_cpuInfo = null;
    tempCpuInfo = null;
  },
  writable: false,
  enumerable: false

})