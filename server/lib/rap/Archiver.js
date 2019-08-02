require("../global/global.localRequire");
const pt = require("path")
/**
 * @constructor
 * @param {String} format The archive format to use.
 * @param {(CoreOptions|TransformOptions)} options See also {@link ZipOptions} and {@link TarOptions}.
 */
const exeTemplDir = localRequire('@/server/exe/templ',true);
const winRARFile = localRequire('@/server/exe/WinRAR.exe',true);
const iconvFile = localRequire('@/server/exe/iconv.exe',true);


// iconv -f UTF-8 -t GBK tempPack1.bat > tempPack2.bat
var uuid=0;
var controlUuid=0;
class Archiver{

    constructor(system,exec){
        this.system = system;
        this.exec = exec;
    }
	 /**
     *outFile:打包之后的文件
     * packFiles：需要打包的文件
      * 返回promise
     * */
    pack(packFiles,outFile){

         if(!outFile){
             console.log("archiver error:archiver moudle out file can not find;");
             return;
         }

         if(packFiles && !Array.isArray(packFiles)){
             packFiles = [packFiles];
         }

         if(!packFiles||packFiles.length==0){
             console.log("archiver error:archiver moudle pack files can not find;");
             return;
         }

         uuid++;
         controlUuid++;
         var lstTempPack = exeTemplDir+"/lstTempPack"+uuid+".lst";
         var converLstTempPack = exeTemplDir+"/converLstTempPack"+uuid+".lst";
         //a -y @
         var packCmd = winRARFile +" a -y " + outFile +" @"+ converLstTempPack;


         //cmd执行文件必须是ansi不然中文会乱码
         return this.system.output.write(lstTempPack,packFiles.join("\r\n"))
             .then(()=>{
                 return this.exec(iconvFile + " -f UTF-8 -t GBK " + lstTempPack + " > " + converLstTempPack);
             })
             .then(()=>{
                 this.resetUuid();
                 return this.exec(packCmd);
             })
             .catch((e)=>{
                 console.log("archiver error:",e);
                 this.resetUuid();
             });
    }
    /**
     *outFile:解压存放路径
     * unpackFiles：解压文件
     * 返回一个promise
     * */
    unpack(unpackFile,outFile){

        if(!outFile){
            console.log("archiver error:archiver moudle out file can not find;");
            return;
        }

        var packCmd = winRARFile +" x -y " + unpackFile + (outFile?(" "+outFile+"/"):"");

        console.log("archiver解压到",outFile?pt.resolve(outFile):unpackFile.replace(/\.rar$|.zip$/i,""));

        return this.exec(packCmd);
    }
    /**
     *可以区分压缩文件
     * */
    resetUuid(){
        controlUuid--;
        if(controlUuid==0){
            uuid=0
        }
    }
}

 module.exports = Archiver