require("../lib/global/global.localRequire");
const {
	getArgAndCode,
	getArgLen,
	formatSpace,
	removeNote,
	findLeftOffsetByExpression,
	findRightOffsetByStatement,
	findLeftOffsetByString,
	matchAndOrExcepssion
  } = localRequire("@/server/lib/node_modules/enhanced-resolve/lib/codeParse.js");

//formatSpace
test(`codeParse formatSpace`, () => {
	function a(){
		var a = "sfdskf sdfkdsf     dskfjksdfjlkds";
		var d = "\ndsjfksdjfsl\r"
		//
		var c = 'dsfsdf     sdfsdfsd'
	  
		var fsdf
			var d;
	  }
	  //tostring会自动将//提到上一行的后面前面会加上; ，a()后面会加上空格,换行toString会自动加上;
	  var s = "function a() {\nvar a = \"sfdskf sdfkdsf     dskfjksdfjlkds\";\nvar d = \"\\ndsjfksdjfsl\\r\"; \/\/\nvar c = 'dsfsdf     sdfsdfsd';\nvar fsdf;\nvar d;\n}"
	  var ddd = formatSpace(a.toString())==s;
	  
	  expect(ddd).toBe(true);
})

//removeNote
test(`codeParse removeNote`, () => {
	let code = removeNote("\nsdfjsdkf//qudiaoline1\ndsjfksdjf/*qudiaomutileline1*/\n'//buyaoqudiao2\\'\"line'\n'/*buyaoqudiao2\\'mutil\"line*/'\n \"//buyaoqudiao3\'\\\"line\"\n\"/*buyaoqudiao3\'mutil\\\"line*/\"")
	 
	let stob = "\nsdfjsdkf\ndsjfksdjf\n'//buyaoqudiao2\\'\"line'\n'/*buyaoqudiao2\\'mutil\"line*/'\n \"//buyaoqudiao3\'\\\"line\"\n\"/*buyaoqudiao3\'mutil\\\"line*/\""
	expect(code).toBe(stob);
})

//getArgAndCode
test(`codeParse getArgAndCode`, () => {

	function fn1(a, b) {
		function in1(s) {} }
	  
	  function fn2(...a) {
		function in2(s) {} }
	  
	  function fn3(...d) {
		function in3(s) {} }
	  
	  function fn4([]) {
		function in4(s) {} }
	  
	  function fn5([a, b]) {
		function in5(s) {} }
	  
	  function fn6({ a, b }) {
		function in6(s) {} }
	  
	  function fn7({ a, b }, [d, c]) {
		function in7(s) {} }
	  
	  function fn8({ a, b }, d = {}) {
		function in8(s) {} 
	  }
	  async function fn9({ a, b }, d = {}) {
		function in9(s) {} 
	  }
	  var fn10 = ({ a, b }) => { 
		return ({ a, b }) => {} 
	  }
	  var fn11 = function({ a, b }) { 
		return ({ a, b }) => {}
	   }
	  var fn12 = a => { 
		return ({ a, b }) => {}
	   }
	   var fn13 = async a => { 
		return ({ a, b }) => {}
	   }

	   function trim(a){
		a[0] = a[0].replace(/\s+/g,"")
		a[1] = a[1].replace(/\s+/g,"")
		return a;
	}
	  let code1 = trim(getArgAndCode(fn1))
	  let code2 = trim(getArgAndCode(fn2))
	  let code3 = trim(getArgAndCode(fn3))
	  let code4 = trim(getArgAndCode(fn4))
	  let code5 = trim(getArgAndCode(fn5))
	  let code6 = trim(getArgAndCode(fn6))
	  let code7 = trim(getArgAndCode(fn7))
	  let code8 = trim(getArgAndCode(fn8))
	  let code9 = trim(getArgAndCode(fn9))
	  let code10 = trim(getArgAndCode(fn10))
	  let code11 = trim(getArgAndCode(fn11))
	  let code12 = trim(getArgAndCode(fn12))
	  let code13 = trim(getArgAndCode(fn13))



	  expect(code1).toEqual(["functionin1(s){}", "a,b", "fn1", false]);
	  expect(code2).toEqual(["functionin2(s){}", "...a", "fn2", false]);
	  expect(code3).toEqual(["functionin3(s){}", "...d", "fn3", false]);
	  expect(code4).toEqual(["functionin4(s){}", "[]", "fn4", false]);
	  expect(code5).toEqual(["functionin5(s){}", "[a,b]", "fn5", false]);
	  expect(code6).toEqual(["functionin6(s){}", "{a,b}", "fn6", false]);
	  expect(code7).toEqual(["functionin7(s){}", "{a,b},[d,c]", "fn7", false]);
	  expect(code8).toEqual(["functionin8(s){}", "{a,b},d={}", "fn8", false]);
	  expect(code9).toEqual(["functionin9(s){}", "{a,b},d={}", "fn9", true]);
	  expect(code10).toEqual(["return({a,b})=>{};", "{a,b}", "", false]);
	  expect(code11).toEqual(["return({a,b})=>{};", "{a,b}", undefined, false]);
	  expect(code12).toEqual(["return({a,b})=>{};", "a", "", false]);
	  expect(code13).toEqual(["return({a,b})=>{};", "a", "", true]);


})

//getArgAndCode
test(`codeParse getArgAndCode`, () => {
	let len1 = getArgLen("{a,b}")
	let len2 = getArgLen("{a,b},b")
	let len3 = getArgLen("{a,b},b={}")
	let len4 = getArgLen("{a,b},b=[1,2]")
	let len5 = getArgLen("a,b")
	let len6 = getArgLen("a,b=[1,2]")
	let len7 = getArgLen("b=[1,2]")
	expect(len1).toBe(1);
	expect(len2).toBe(2);
	expect(len3).toBe(2);
	expect(len4).toBe(2);
	expect(len5).toBe(2);
	expect(len6).toBe(2);
	expect(len7).toBe(1);

})


//findLeftOffsetByExpression
test(`codeParse findLeftOffsetByExpression`, () => {

	var a1= findLeftOffsetByExpression("var a,b;var c=a+")
	var a2= findLeftOffsetByExpression("var a,b\nvar c=a+")
	var a3= findLeftOffsetByExpression("var a,c=b+\n")
	var a4= findLeftOffsetByExpression("var f='{;\\''+\n\"{;\",a,d={},e=[],go=function(){\nvar c=3;e='sdfsf}'\n;},c=b+\n")
	var a5= findLeftOffsetByExpression("var ggg=a\n{var f='{;\\''+\n\"\\\"{;\",a,d={},e=[],go=function(){\nvar c=3;e='sdfsf}'\n;},c=b+\n")
	expect(a1).toBe(7);
	expect(a2).toBe(7);
	expect(a3).toBe(-1);
	expect(a4).toBe(-1);
	expect(a5).toBe(10);

})

//findLeftOffsetByExpression
test(`codeParse findLeftOffsetByExpression`, () => {

	var a1= findLeftOffsetByExpression("var a,b;var c=a+")
	var a2= findLeftOffsetByExpression("var a,b\nvar c=a+")
	var a3= findLeftOffsetByExpression("var a,c=b+\n")
	var a4= findLeftOffsetByExpression("var f='{;\\''+\n\"{;\",a,d={},e=[],go=function(){\nvar c=3;e='sdfsf}'\n;},c=b+\n")
	var a5= findLeftOffsetByExpression("var ggg=a\n{var f='{;\\''+\n\"\\\"{;\",a,d={},e=[],go=function(){\nvar c=3;e='sdfsf}'\n;},c=b+\n")
	
	expect(a1).toBe(7);
	expect(a2).toBe(7);
	expect(a3).toBe(-1);
	expect(a4).toBe(-1);
	expect(a5).toBe(10);

})


//findLeftOffsetByExpression
test(`codeParse findRightOffsetByStatement`, () => {

	var a1 = findRightOffsetByStatement("var a,b,d={},c={a:1,b:{},g:function(){}}")
	var a2 = findRightOffsetByStatement("var a,b,d={},c={a:1,\nb:{},\ng:function(){\n}},e=function(){},\nf=a=>{},g='\\'sdf{;';")
	var a3 = findRightOffsetByStatement("var a,b,d={},c={a:1,\nb:{}\ng:function(){\n}}\nconst e=function(){},\nf=a=>{},g='\\'sdf{;';")

	expect(a1.state).toBe("var a,b,d,c;");
	expect(a1.code).toBe("a,b,d={},c={a:1,b:{},g:function(){}}");
	expect(a2.state).toBe("var a,b,d,c,e,\nf,g;");
	expect(a2.code).toBe("a,b,d={},c={a:1,\nb:{},\ng:function(){\n}},e=function(){},\nf=a=>{},g='\\'sdf{;';");
	expect(a3.state).toBe("var a,b,d,c;const e,\nf,g;");
	expect(a3.code).toBe("a,b,d={},c={a:1,\nb:{}\ng:function(){\n}}\ne=function(){},\nf=a=>{},g='\\'sdf{;';");

})

//findLeftOffsetByString
test(`codeParse findRightOffsetByStatement`, () => {


	var a1 = findLeftOffsetByString("(a,s,b)(g,d,e),d)",")","(")
	var a2 = findLeftOffsetByString("(a,s,b)(g,d,e:(,)),d)",")","(")
	var a3 = findLeftOffsetByString("{a,s,b}{g,d,e},d}","}","{")
	var a4 = findLeftOffsetByString("{a,s,b}{g=\"}\",d='}',e:{}},d}","}","{")

	expect(a1).toBe(16);
	expect(a2).toBe(20);
	expect(a3).toBe(16);
	expect(a4).toBe(27);

})



//matchAndOrExcepssion
test(`codeParse matchAndOrExcepssion`, () => {


	var a1 = matchAndOrExcepssion("(a&&")
	var a2 = matchAndOrExcepssion("((a='a')&&")
	var a3 = matchAndOrExcepssion("((a={})&&")
	var a4 = matchAndOrExcepssion("{(a={})&&")
	var a5 = matchAndOrExcepssion(";(a={})&&")
	var a6 = matchAndOrExcepssion(",(a={})&&")
	var a7 = matchAndOrExcepssion(",(a={})&&(a>")
	var a8 = matchAndOrExcepssion(",(a={})&&((a)>")
	var a9 = matchAndOrExcepssion(",(a={})&&((a)>b&&")
	var a10 = matchAndOrExcepssion(",(a={})||((a)>b&&")

	expect(a1.needQ).toBe(true);
	expect(a2.needQ).toBe(true);
	expect(a3.needQ).toBe(true);
	expect(a4.needQ).toBe(false);
	expect(a5.needQ).toBe(false);
	expect(a6.needQ).toBe(false);
	expect(a7.needQ).toBe(true);
	expect(a8.needQ).toBe(true);
	expect(a9.needQ).toBe(true);
	expect(a10.needQ).toBe(true);

	expect(a1.code).toBe("(a&&")
	expect(a2.code).toBe("((a='a')&&")
	expect(a3.code).toBe("((a={})&&")
	expect(a4.code).toBe("(a={})&&")
	expect(a5.code).toBe("(a={})&&")
	expect(a6.code).toBe("(a={})&&")
	expect(a7.code).toBe("(a={})&&(a>")
	expect(a8.code).toBe("(a={})&&((a)>")
	expect(a9.code).toBe("(a={})&&((a)>b&&")
	expect(a10.code).toBe("(a={})||((a)>b&&")

})
