const cp = require('child_process')
const pt = require('path');
const os = require('os');

require("../global/global.localRequire");
const exeTemplDir = localRequire("@/server/exe/cmd/templ", true);
const iconvFile = localRequire("@/server/exe/iconv.exe", true);
const GbkDecoder = localRequire('@/server/lib/node_modules/iconv-lite/GbkDecoder.js');
const iconvGBK = new GbkDecoder();
const execPath = process.cwd();
// HACK: to make our calls to exec() testable,
// support using a mock shell instead of a real shell
var shell = process.env.SHELL || 'sh';
// support for Win32 outside Cygwin/command.exe
if (os.platform() === 'win32' && process.env.SHELL === undefined) {
  shell = process.env.COMSPEC || 'cmd.exe';
}

//必须全局
var uuid = 0;
var lock = {}

/**
 * / 合并当前的env
 */
function createEnv(params) {
  var env = {};
  var item;

  for (item in process.env) {
    env[item] = process.env[item];
  }

  for (item in params) {
    env[item] = params[item];
  }

  return env;
}

class Cmd {
  constructor(system, environment, path) {
    this.env = createEnv(environment || {});
    this.execPath = path || execPath;
    this.system = system.output;
  }
  /**
   *
   * @param file
   * @param callback
   * 将文件转换为GBK
   */
  converFileUTF8toGBK(file) {
    uuid++;
    var converFile = exeTemplDir + "/converCmd" + uuid + ".bat";
    let cmd = `${iconvFile}  -f UTF-8 -t GBK ${file} > ${converFile}`;
    return this.exec(cmd).then(()=>{
      return converFile;
    }).finally(() => {
      uuid--;
    });
  }

  //执行命令,exec并不会退出
  async exec(cmd) {
    return new Promise((resolve, reject) => {
    let child = cp.exec(cmd,
        {  shell:shell,
            cwd: this.execPath,
            env: this.env,
            encoding:null
        },
        function(e, stdout, stderr) {
          if (e) {
            reject(e);
          } else if(stderr&&stderr.length) {
            stderr = iconvGBK.decode(stderr);//使用GBK解码
            reject(stderr);
          }else{
            stdout = iconvGBK.decode(stdout);//使用GBK解码
            resolve(stdout);
          }
          if(child.stdout){
            child.stdout.destroy();
          }
          if(child.stderr){
            child.stderr.destroy();
          }
          child = null;
        }
      )
      //只要有数据输出就结束
        if(child.stdout){
          child.stdout.on('data',  (chunk)=> {
            child.emit("close",0,null);
           })
        }
        if(child.stderr){
          child.stderr.on('data', function (chunk) {
            child.emit("close",0,null);
           })
        }
    })
  }

  //执行命令和文件
  async execApi(scriptFile) {

    //保证当前路径被创建
    await this.system.create(exeTemplDir);

    var existScriptFile = false;
    var cmd;

    //如果执行的是文件
    if (/(bat)|(cmd)|(exe)/.test(pt.extname(scriptFile))) {
      existScriptFile = true;
    }

    if (existScriptFile) {
      //防止中文乱码
      cmd = await this.converFileUTF8toGBK(scriptFile);
    } else {
      cmd = scriptFile;
    }

    // transform windows backslashes to forward slashes for use in cygwin on windows
    if (pt.sep === '\\') {
      cmd = cmd.replace(/\\/g, '/');
    }

    //当前命令正在执行
    if (lock[cmd]) {
      console.log("cmd执行太频繁", cmd)
      return;
    } else {
      lock[cmd] = true;
    }

    cmd = cmd.split("&&");

    let ret = [];
   for(var i=0;i<cmd.length;i++){
     ret.push(await this.exec(cmd[i]));
   }
    
    lock[cmd] = false

    return ret.join("");
  }
}

module.exports = Cmd;

localRequire("@/server/lib/rap/rap.js");
var cmd = new Cmd(rap.system)
cmd.execApi("nslookup && calc").then((ret)=>{
console.log(11)
});