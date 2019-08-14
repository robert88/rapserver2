require("../global/global.localRequire");
const pt = require("path")
/**
 * @constructor
 * @param {String} format The archive format to use.
 * @param {(CoreOptions|TransformOptions)} options See also {@link ZipOptions} and {@link TarOptions}.
 */
const exeTemplDir = localRequire('@/server/exe/templ', true);
const winRARFile = localRequire('@/server/exe/WinRAR.exe', true);
const iconvFile = localRequire('@/server/exe/iconv.exe', true);

const cmdPath = process.cwd();

// iconv -f UTF-8 -t GBK tempPack1.bat > tempPack2.bat
var uuid = 0;
var controlUuid = 0;
class Archiver {

  constructor(system, cmd) {
    this.system = system;
    this.cmd = cmd;
  }
  /**
   *outFile:打包之后的文件
   * packFiles：需要打包的文件
   * 返回promise
   * */
  pack(packFiles, outFile, options, callback) {
    if (typeof options == "function") {
      callback = options;
      options = {};
    }
    options = options || {};
    callback = callback || function() {}
    //相对地址控制打包文件夹
    var relativePath = options.relative;
    //控制是否覆盖打包文件中的已有的文件,f表示只覆盖不新增,测试无效
    var func = "a" //options.over?"f":"a"

    //打包之后是否删除文件
    func = options.clear ? "m" : func

    // 4、按10kb为最小分割大小分卷打包
    var splitSize = options.splitSize ? `-v${Math.max(10,options.splitSize)}` : ""

    if (!outFile) {
      callback(new Error("archiver moudle out file can not find;"));
      return;
    }

    //不是rar这些功能无效
    if (pt.extname(outFile) != ".rar") {
      rm = "";
      splitSize = ""
    }

    if (typeof packFiles == "string") {
      if (packFiles == relativePath) {
        callback(new Error("archiver moudle params relative == packfiles"));
        return;
      }
      packFiles = [packFiles];
    }

    if (!packFiles || packFiles.length == 0) {
      callback(new Error("archiver moudle pack files can not find"));
      return;
    }

    uuid++;
    controlUuid++;
    var lstTempPack = exeTemplDir + "/lstTempPack" + uuid + ".lst";
    var converLstTempPack = exeTemplDir + "/converLstTempPack" + uuid + ".lst";

    //rar.exe a -y @ a.zip @ converLstTempPack0.lst
    var packCmd = `${winRARFile} ${func} -y ${outFile} @${converLstTempPack}  ${splitSize}`;

    if (relativePath) {
      //改变执行的路径可以改变打包的文件夹
      let relativePackFiles = [];
      packFiles.forEach(T => {
        relativePackFiles.push(pt.relative(relativePath, T));
      });
      packFiles = relativePackFiles;
    }

    //cmd执行文件必须是ansi不然中文会乱码
    this.system.output.write(lstTempPack, packFiles.join("\r\n"))
      .then(() => {
        return this.cmd.execApi(iconvFile + " -f UTF-8 -t GBK " + lstTempPack + " > " + converLstTempPack);
      })
      .then(() => {
        this.resetUuid();
        if (relativePath) {
          this.cmd.execPath = relativePath;
        } else {
          this.cmd.execPath = cmdPath;
        }
        return this.cmd.execApi(packCmd);
      })
      .then(resolve => {
        this.resetUuid();
        callback(null, packCmd, resolve);
      }, reject => {
        this.resetUuid();
        callback(reject, packCmd);
      })
  }
  /**
   *outFile:解压存放路径
   * unpackFiles：解压文件
   * 返回一个promise
   * */
  unpack(unpackFile, outFile, callback) {

    if (!outFile) {
      callback(new Error("archiver moudle out file can not find"))
      return;
    }

    var packCmd = winRARFile + " x -y " + unpackFile + (outFile ? (" " + outFile + "/") : "");
    this.cmd.execApi(packCmd)
      .then(resolve => {
        callback(null, packCmd, resolve);
      }, reject => {
        callback(reject, packCmd);
      })
  }

  /**
   *可以区分压缩文件
   * */
  resetUuid() {
    controlUuid--;
    if (controlUuid <= 0) {
      controlUuid = 0;
      uuid = 0
    }
  }
  //只能删除最外层
  remove(rar, file, callback) {
    // WinRAR d help info.txt//从help中删除info.txt
    var packCmd = `${winRARFile} d -y ${rar} ${file}`

    this.cmd.execApi(packCmd)
      .then(resolve => {
        callback(null, packCmd, resolve);
      }, reject => {
        callback(reject, packCmd);
      })

  }
  //只能改最外层的名称
  rename(rar, orgName, newName, callback) {
    // WinRAR rn help readme.txt readme.bak info.txt info.bak //将压缩包readme.txt改为readme.bak ，info.txt改为info.bak
    var packCmd = `${winRARFile} rn -y ${rar} ${orgName} ${newName}`
    this.cmd.execApi(packCmd)
      .then(resolve => {
        callback(null, packCmd, resolve);
      }, reject => {
        callback(reject, packCmd);
      })
  }
  /**
   *查找压缩文件中文件
   * */
  find(rar, callback) {
    throw "not use";
    // var packCmd = `${winRARFile} x -y ${rar}`
    // this.cmd.execApi(packCmd)
    //   .catch(e => {
    //     callback(e);
    //   }).then(r => {
    //     callback(null,packCmd,r);
    //   });
  }
}

module.exports = Archiver