require("../lib/global/global.localRequire");
var makeCallbackFunc = localRequire("@/server/lib/node_modules/enhanced-resolve/lib/makeCallbackFunc.js");

//在性能方面callback要由于async
test("makeCallbackFunc 将异步代码转为callback异步方式", () => {

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
    var t = makeCallbackFunc(a1.toString()).toString().replace(/\s+/g,"");
    //toString会把没有用的()去掉，而！这样会添加（）
    expect(t).toBe('function(__error__){if(__error__){throw__error__;}letb={};leta=1+2;lettest=function(__buildAsyncError__){if(__error__){throw__error__;}letd=1;};test(function(__error__,__result__){if(__error__){throw__error__;}lett=__result__;if(a){b=1;}test(function(__error__,__result__){if(__error__){throw__error__;}if(!(__result__)){b=3;}letobj={test:test};letg=\'1\';obj["test"](function(__error__,__result__){if(__error__){throw__error__;}letd=__result__;})})})}');
  }
  // //带参数1
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
     var t = makeCallbackFunc(a1.toString()).toString().replace(/\s+/g,"");
     //toString会把没有用的()去掉，而！这样会添加（）
     expect(t).toBe('function(__error__,parama,paramb){if(__error__){throw__error__;}letb={};leta=1+2;lettest=function(__buildAsyncError__){if(__error__){throw__error__;}letd=1;};test(function(__error__,__result__){if(__error__){throw__error__;}lett=__result__;if(a){b=1;}test(function(__error__,__result__){if(__error__){throw__error__;}if(!(__result__)){b=3;}letobj={test:test};letg=\'1\';obj["test"](function(__error__,__result__){if(__error__){throw__error__;}letd=__result__;})})})}');
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
    var t = makeCallbackFunc(a1.toString()).toString().replace(/\s+/g,"");
    //toString会把没有用的()去掉，而！这样会添加（）
    expect(t).toBe('function(__error__,{parama,paramb}){if(__error__){throw__error__;}letb={};leta=1+2;lettest=function(__buildAsyncError__){if(__error__){throw__error__;}letd=1;};test(function(__error__,__result__){if(__error__){throw__error__;}lett=__result__;if(a){b=1;}test(function(__error__,__result__){if(__error__){throw__error__;}if(!(__result__)){b=3;}letobj={test:test};letg=\'1\';obj["test"](function(__error__,__result__){if(__error__){throw__error__;}letd=__result__;})})})}');
  
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
    var t = makeCallbackFunc(a1.toString()).toString().replace(/\s+/g,"");
    //toString会把没有用的()去掉，而！这样会添加（）
   expect(t).toBe('function(__error__,parama=[],paramb){if(__error__){throw__error__;}letb={};leta=1+2;lettest=function(__buildAsyncError__){if(__error__){throw__error__;}letd=1;};test(function(__error__,__result__){if(__error__){throw__error__;}lett=__result__;if(a){b=1;}test(function(__error__,__result__){if(__error__){throw__error__;}if(!(__result__)){b=3;}letobj={test:test};letg=\'1\';obj["test"](function(__error__,__result__){if(__error__){throw__error__;}letd=__result__;})})})}');
  
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
      let f = "await is function async";
      let obj = {test:test};
      let g = '1 async\' ';
      let d =  await obj['test']();
    }
    var t = makeCallbackFunc(a1.toString()).toString().replace(/\s+/g,"");
     //toString会把没有用的()去掉，而！这样会添加（）
      expect(t).toBe('function(__error__,{parama:{},paramb}){if(__error__){throw__error__;}letb={};leta=1+2;lettest=function(__buildAsyncError__){if(__error__){throw__error__;}letd=1;};test(function(__error__,__result__){if(__error__){throw__error__;}lett=__result__;if(a){b=1;}test(function(__error__,__result__){if(__error__){throw__error__;}if(!(__result__)){b=3;}letf="awaitisfunctionasync";letobj={test:test};letg=\'1async\\\'\';obj[\'test\'](function(__error__,__result__){if(__error__){throw__error__;}letd=__result__;})})})}');
    }

});