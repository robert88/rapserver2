const exec = require('child_process').exec;
const path = require('path');
const os = require('os');

require("../global/global.localRequire");
const exeTemplDir = localRequire("@/server/exe/cmd/templ", true);
const iconvFile = localRequire("@/server/exe/iconv.exe");

const execPath = process.cwd();
// HACK: to make our calls to exec() testable,
// support using a mock shell instead of a real shell
const shell = process.env.SHELL || 'sh';
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

//解析接口
async function exec(){

}

class Cmd {
  constructor( environment, path) {
    this.env = createEnv(environment || {});
    this.execPath = path || execPath;
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
    return this.exec(cmd).finally(()=>{
      uuid--;
      return converFile;
    });
  }

  //执行命令
  async exec(cmd) {
    return new Promise((resolve, reject) => {
      exec(cmd, {shell: shell,cwd: this.execPath, env: this.env },
        function(e, stdout, stderr) {
          if (e) {
            reject(e);
          } else {
            resolve(stdout, stderr);
          }
        }
      )
    })
  }

  //执行命令和文件
  async execApi(scriptFile) {

    var existScriptFile = false;
    var cmd;

    //如果执行的是文件
    if (/(bat)|(cmd)/.test(pt.extname(scriptFile))) {
      existScriptFile = true;
    }

    if (existScriptFile) {
      //防止中文乱码
      cmd = await this.converFileUTF8toGBK(existScriptFile);
    } else {
      cmd = scriptFile;
    }

    // transform windows backslashes to forward slashes for use in cygwin on windows
    if (path.sep === '\\') {
      cmd = cmd.replace(/\\/g, '/');
    }

    //当前命令正在执行
    if (lock[cmd]) {
      console.log("cmd执行太频繁", cmd)
      return;
    } else {
      lock[cmd] = true;
    }
    let ret = await this.exec(cmd);

    lock[cmd] = false

   return  ret;
  }
}

