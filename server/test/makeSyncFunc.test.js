require("../lib/global/global.localRequire");
var makeSyncFunc = localRequire("@/server/lib/node_modules/enhanced-resolve/lib/makeSyncFunc.js");

test("makeSyncFunc 将异步代码转为同步代码", () => {

  {
    let a1 = async function(){
      let b = {}; 
      let a= (1+2);
      let  test = async function(){
        let d = 1;
      }; 
      let t = await test();
      if(a){
        b=1;
      }
      if(!await test()){
        b=3;
      }
      let obj = {test:test};
      let g = '1';
      let d =  await obj["test"]();
    }
    var t = makeSyncFunc(a1.toString()).toString().replace(/\s+/g,"");
    expect(t).toBe('function(){letb={};leta=(1+2);lettest=asyncfunction(){letd=1;};lett=testSync();if(a){b=1;}if(!testSync()){b=3;}letobj={test:test};letg=\'1\';letd=obj["test"+"Sync"]();}');
  }
  // {
  //   let a1 = async function(a,b){
  //     let b = {}; 
  //     let a= (1+2);
  //     if(a){
  //       b=1;
  //     }
  //    }
  //   expect(makeSyncFunc(a1.toString()).replace(/\s+/g,"")).toBe("function(){let b = {}; }".replace(/\s+/g,""));
  // }
  // {
  //   let a1 = async function({a,b}){
  //     let b = {}; 
  //     let a= (1+2);
  //     if(a){
  //       b=1;
  //     }
  //   }
  //   expect(makeSyncFunc(a1.toString()).replace(/\s+/g,"")).toBe("function(){let b = {}; }".replace(/\s+/g,""));
  // }
  // {
  //   let a1 = async function(a=[],b){
  //     let b = {}; 
  //     let a= (1+2);
  //     if(a){
  //       b=1;
  //     }
  //   }
  //   expect(makeSyncFunc(a1.toString()).replace(/\s+/g,"")).toBe("function(){let b = {}; }".replace(/\s+/g,""));
  // }
  // {
  //   let a1 = async function({a:{},b}){
  //     let b = {}; 
  //     let a= (1+2);
  //     if(a){
  //       b=1;
  //     }
  //   }
  //   expect(makeSyncFunc(a1.toString()).replace(/\s+/g,"")).toBe("function(){let b = {}; }".replace(/\s+/g,""));
  // }

});