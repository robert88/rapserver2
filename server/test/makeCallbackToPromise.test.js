require("../lib/global/global.localRequire");
var makeCallbackToPromise = localRequire("@/server/lib/node_modules/enhanced-resolve/lib/makeCallbackToPromise.js");

//在性能方面callback要由于async
test("makeCallbackToPromise 将callback异步转为promise异步方式", () => {

  {

    var obj = {
      wake: function (errparams, callback) {
        var ret = 1;
        ///为了测试
        var err = errparams&&new Error(errparams);
        setTimeout(()=>{
          callback(err, ret);
        },10)
      },
      wakeSync: function () { }
    }
    
    obj.wake("err1", (err, ret) => {
      expect(err.message).toBe("err1");
      expect(ret).toBe(1);
    });

    makeCallbackToPromise(obj)
    
    obj.wake().then(ret => {
      expect(ret).toBe(1);
     });
    
    obj.wake("err2").catch(e=>{
      expect(e.message).toBe("err2");
    })
    let mo = jest.fn();
    obj.wake(null,()=>{
      mo();
    }).catch(e=>{
      expect(mo.mock.calls.length).toBe(0);
    })
  }


var create = async function (createDirPath,isFile,callback) {

  if (!createDirPath) {
    return;
  }

  if (await this.system.exists(createDirPath)) {
    return;
  }

  //最外层肯定要存在,才可以创建文件
  let parentDirPath = pt.dirname(createDirPath);

  if (parentDirPath && !await this.system.exists(parentDirPath)) {
    await this.create(parentDirPath,false);
  }
  //必须指定
  if(isFile){
    await this.system.writeFile(createDirPath,"");
  }else{
    await this.system.mkdir(createDirPath);
  }

  this.system.purge("stat",createDirPath);

  if (typeof callback == "function") {
    callback();
  }
}

makeCallbackToPromise(create)

});