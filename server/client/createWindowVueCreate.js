
// 解决vue create 的bug
require("../server/lib/global/global.localRequire");

localRequire("@/server/lib/global/global.js");

localRequire("@/server/lib/rap/rap.js");

var sysUserPath = process.env.USERPROFILE;

var needWrite = false;
if( rap.system.input.existsSync(sysUserPath+"/.bashrc")){
   var data =  rap.system.input.readDataSync(sysUserPath+"/.bashrc");
   if(data.indexOf("alias vue='winpty vue.cmd'")==-1){
    needWrite = true;
   }
}else{
    needWrite = true;
}

if(needWrite){
    rap.system.output.write(sysUserPath+"/.bashrc","\nalias vue='winpty vue.cmd'\n",true)
}
