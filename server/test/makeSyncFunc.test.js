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
    var t = makeSyncFunc(a1).toString().replace(/\s+/g,"");
    //toString会把没有用的()去掉，而！这样会添加（）
    expect(t).toBe('function(){letb={};leta=1+2;lettest=function(){letd=1;};lett=testSync();if(a){b=1;}if(!(testSync())){b=3;}letobj={test:test};letg=\'1\';letd=obj["test"+"Sync"]();}');
  }
  //带参数1
  {
    let a1 = async function ( parama , paramb ){
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
     var t = makeSyncFunc(a1).toString().replace(/\s+/g,"");
     //toString会把没有用的()去掉，而！这样会添加（）
     expect(t).toBe('function(parama,paramb){letb={};leta=1+2;lettest=function(){letd=1;};lett=testSync();if(a){b=1;}if(!(testSync())){b=3;}letobj={test:test};letg=\'1\';letd=obj["test"+"Sync"]();}');
   }

  {
    let a1 = async function({parama,paramb}){
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
    var t = makeSyncFunc(a1).toString().replace(/\s+/g,"");
    //toString会把没有用的()去掉，而！这样会添加（）
    expect(t).toBe('function({parama,paramb}){letb={};leta=1+2;lettest=function(){letd=1;};lett=testSync();if(a){b=1;}if(!(testSync())){b=3;}letobj={test:test};letg=\'1\';letd=obj["test"+"Sync"]();}');
  }
  {
    let a1 = async function(parama=[],paramb){
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
    var t = makeSyncFunc(a1).toString().replace(/\s+/g,"");
    //toString会把没有用的()去掉，而！这样会添加（）
    expect(t).toBe('function(parama=[],paramb){letb={};leta=1+2;lettest=function(){letd=1;};lett=testSync();if(a){b=1;}if(!(testSync())){b=3;}letobj={test:test};letg=\'1\';letd=obj["test"+"Sync"]();}');
  }
  {
    let a1 = async function({parama:{},paramb}){
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
      let f = " await is function async";
      let obj = {test:test};
      let g = '1 async\' ';
      let d =  await obj['test']();
    }
    var t = makeSyncFunc(a1).toString().replace(/\s+/g,"");
     //toString会把没有用的()去掉，而！这样会添加（）
     expect(t).toBe('function({parama:{},paramb}){letb={};leta=1+2;lettest=function(){letd=1;};lett=testSync();if(a){b=1;}if(!(testSync())){b=3;}letf="awaitisfunctionasync";letobj={test:test};letg=\'1async\\\'\';letd=obj[\'test\'+"Sync"]();}');
   }

});