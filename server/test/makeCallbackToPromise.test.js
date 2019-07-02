require("../lib/global/global.localRequire");
var makeCallbackToPromise = localRequire("@/server/lib/node_modules/enhanced-resolve/lib/makeCallbackToPromise.js");

//在性能方面callback要由于async
test("makeCallbackToPromise 将callback异步转为promise异步方式", () => {

  {

    var obj = {
      wake: function (params, callback) {
        setTimeout(()=>{
          callback(null, params)
        },10)
      },
      wakeSync: function () { }
    }

    obj.wake("www", (err, pa) => {
      expect(err).toBeNull();
      expect(pa).toBe("www");
    });

    makeCallbackToPromise(obj)

    obj.wake("www").then(pa => { expect(pa).toBe("www"); });

    obj.wake("www",function(){
      throw "err"
    }).catch(e=>{
      expect(e.message).toBe("err");
    })

  }

});