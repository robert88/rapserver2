require("../lib/global/global.localRequire");
var makeCallbackFunc = localRequire("@/server/lib/node_modules/enhanced-resolve/lib/makeCallbackFunc.js");

//在性能方面callback要由于async
test("makeCallbackFunc 将异步代码转为callback异步方式", () => {

  {
    let a1 = async function() {
      let b = {};
      let a = (1 + 2);
      let test = async function() {
        let d = 1;
      };
      let t = await test();
      if (a) {
        b = 1;
      }
      if (!await test()) {
        b = 3;
      }
      let obj = { test: test };
      let g = '1';
      let d = await obj["test"]();
    }
    let tet = makeCallbackFunc(a1).toString().replace(/\s+/g, "");
    let ret = "function(__error__){if(__error__){throw__error__;}letb={};leta=1+2;lettest=function(__buildAsyncError__){if(__error__){throw__error__;}letd=1;};lett;test(function(__error__1,__result__1){if(__error__1){throw__error__1;}t=__result__1;if(a){b=1;}test(function(__error__2,__result__2){if(__error__2){throw__error__2;}if(!(__result__2)){b=3;}letobj={test:test};letg='1';letd;obj[\"test\"](function(__error__3,__result__3){if(__error__3){throw__error__3;}d=__result__3;})})})}"
    //toString会把没有用的()去掉，而！这样会添加（）
    expect(tet).toBe(ret);
  }
  // //带参数1
  {
    let a1 = async function(parama, paramb) {
      let b = {};
      let a = (1 + 2);
      let test = async function() {
        let d = 1;
      };
      let t = await test();
      if (a) {
        b = 1;
      }
      if (!await test()) {
        b = 3;
      }
      let obj = { test: test };
      let g = '1';
      let d = await obj["test"]();
    }
    let tet = makeCallbackFunc(a1).toString().replace(/\s+/g, "");
    let ret = "function(__error__,parama,paramb){if(__error__){throw__error__;}letb={};leta=1+2;lettest=function(__buildAsyncError__){if(__error__){throw__error__;}letd=1;};lett;test(function(__error__1,__result__1){if(__error__1){throw__error__1;}t=__result__1;if(a){b=1;}test(function(__error__2,__result__2){if(__error__2){throw__error__2;}if(!(__result__2)){b=3;}letobj={test:test};letg='1';letd;obj[\"test\"](function(__error__3,__result__3){if(__error__3){throw__error__3;}d=__result__3;})})})}"
    //toString会把没有用的()去掉，而！这样会添加（）
    expect(tet).toBe(ret);
  }

  {
    let a1 = async function({ parama, paramb }) {
      let b = {};
      let a = (1 + 2);
      let test = async function() {
        let d = 1;
      };
      let t = await test();
      if (a) {
        b = 1;
      }
      if (!await test()) {
        b = 3;
      }
      let obj = { test: test };
      let g = '1';
      let d = await obj["test"]();
    }
    let tet = makeCallbackFunc(a1).toString().replace(/\s+/g, "");
    let ret = "function(__error__,{parama,paramb}){if(__error__){throw__error__;}letb={};leta=1+2;lettest=function(__buildAsyncError__){if(__error__){throw__error__;}letd=1;};lett;test(function(__error__1,__result__1){if(__error__1){throw__error__1;}t=__result__1;if(a){b=1;}test(function(__error__2,__result__2){if(__error__2){throw__error__2;}if(!(__result__2)){b=3;}letobj={test:test};letg='1';letd;obj[\"test\"](function(__error__3,__result__3){if(__error__3){throw__error__3;}d=__result__3;})})})}"
    //toString会把没有用的()去掉，而！这样会添加（）
    expect(tet).toBe(ret);

  }
  {
    let a1 = async function(parama = [], paramb) {
      let b = {};
      let a = (1 + 2);
      let test = async function() {
        let d = 1;
      };
      let t = await test();
      if (a) {
        b = 1;
      }
      if (!await test()) {
        b = 3;
      }
      let obj = { test: test };
      let g = '1';
      let d = await obj["test"]();
    }
    let tet = makeCallbackFunc(a1).toString().replace(/\s+/g, "");
    let ret = "function(__error__,parama=[],paramb){if(__error__){throw__error__;}letb={};leta=1+2;lettest=function(__buildAsyncError__){if(__error__){throw__error__;}letd=1;};lett;test(function(__error__1,__result__1){if(__error__1){throw__error__1;}t=__result__1;if(a){b=1;}test(function(__error__2,__result__2){if(__error__2){throw__error__2;}if(!(__result__2)){b=3;}letobj={test:test};letg='1';letd;obj[\"test\"](function(__error__3,__result__3){if(__error__3){throw__error__3;}d=__result__3;})})})}"
    expect(tet).toBe(ret);
  }
  {
    let a1 = async function({ parama: {}, paramb }) {

      if (!await atesta(paap)) {
        let t = await btestb(pbbp);
        if (!await ctestc(pccp)) {
          let t = await dtestd(pddp) && await eteste(peep);
        }
      }

    }
    let tet = makeCallbackFunc(a1).toString().replace(/\s+/g, "");
    let ret = "function(__error__,{parama:{},paramb}){if(__error__){throw__error__;}atesta(paap,function(__error__1,__result__1){if(__error__1){throw__error__1;}if(!(__result__1)){lett;btestb(pbbp,function(__error__2,__result__2){if(__error__2){throw__error__2;}t=__result__2;ctestc(pccp,function(__error__3,__result__3){if(__error__3){throw__error__3;}if(!(__result__3)){lett;dtestd(pddp,function(__error__4,__result__4){if(__error__4){throw__error__4;}t=(__result__4)&&(eteste(peep,function(__error__5,__result__5){if(__error__5){throw__error__5;}if(__error__4){throw__error__4;}t=(__result__4)&&(__result__5);}))})}})})}})}"
    //toString会把没有用的()去掉，而！这样会添加（）
    expect(tet).toBe(ret);
  }

});